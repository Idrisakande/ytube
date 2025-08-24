import { headers } from "next/headers";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { eq } from "drizzle-orm";
import { VideoAssetCreatedWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetDeletedWebhookEvent } from "@mux/mux-node/resources/webhooks";
import { UTApi } from "uploadthing/server";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!

type MuxWebhookEvent =
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetTrackReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetDeletedWebhookEvent

export const POST = async (request: Request) => {
    if (!SIGNING_SECRET) {
        throw new Error("Mux webhook signing secret is not set.");
    }
    const headersPayload = await headers()
    const muxSignature = headersPayload.get("mux-signature")
    if (!muxSignature) {
        return new Response("No signature found", { status: 401 });
    }
    // const payload = await request.json();
    // const body = JSON.stringify(payload);
    // if (!body) {
    //     return new Response("Empty request body", { status: 400 });
    // }
    // mux.webhooks.verifySignature(
    //     body,
    //     { "Mux-Signature": muxSignature },
    //     SIGNING_SECRET
    // )
    // 1. Read raw body text
    const body = await request.text();

    if (!body) {
        return new Response("Empty request body", { status: 400 });
    }
    // 2. Verify signature using raw body (Mux requires this)
    try {
        mux.webhooks.verifySignature(
            body,
            { "Mux-Signature": muxSignature },
            SIGNING_SECRET
        );
    } catch (err) {
        console.error("Mux signature verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
    }
    // 3. Parse JSON safely
    let payload: MuxWebhookEvent;
    try {
        payload = JSON.parse(body);
    } catch (err) {
        console.error("Invalid JSON body:", body, err);
        return new Response("Invalid JSON", { status: 400 });
    }
    // you can now start using payload.type to run the webhooks
    switch (payload.type as MuxWebhookEvent["type"]) {
        // Handle video asset created event
        case "video.asset.created": {
            const eventData = payload.data as VideoAssetCreatedWebhookEvent["data"];
            const { upload_id } = eventData;
            console.log("Full payload:", payload);
            console.log("upload_id:", { upload_id });
            // console.log("Video data::", { eventData });
            // Ensure the upload ID is present
            if (!upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }
            console.log("Handling video asset created event for upload_id:", upload_id);
            // Handle video asset created event
            const [video] = await db.update(videos)
                .set({
                    muxStatus: eventData.status,
                    muxAssetId: eventData.id,
                })
                .where(eq(videos.muxUploadId, upload_id))
                .returning();
            return new Response(JSON.stringify(video), { status: 200 });
        }
        // Handle video asset ready event
        case "video.asset.ready": {
            const eventData = payload.data as VideoAssetReadyWebhookEvent["data"];
            const { upload_id, playback_ids, id } = eventData;
            // Ensure the asset ID is present
            if (!id) {
                return new Response("Missing asset ID", { status: 400 });
            }
            // Ensure the upload ID is present
            if (!upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }
            const playbackId = playback_ids?.[0]?.id;
            // Ensure the playback ID is present
            if (!playbackId) {
                return new Response("Missing playback ID", { status: 400 });
            } //?width=640&height=360&fit_mode=pad
            const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
            const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
            const duration = eventData.duration ? Math.round(eventData.duration * 1000) : 0;  // Default to 0 if duration is not available

            const utapi = new UTApi()
            const [
                uploadedThumbnail,
                uploadedPreview
            ] = await utapi.uploadFilesFromUrl([
                tempThumbnailUrl,
                tempPreviewUrl
            ])
            if (!uploadedThumbnail.data || !uploadedPreview.data) {
                return new Response(`Failed to upload thumbnail or preview`, { status: 500 })
            }
            const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data
            const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data
            // Handle video asset ready event updateting the video with playback ID and thumbnail URL
            const [video] = await db.update(videos)
                .set({
                    muxStatus: eventData.status,
                    muxPlaybackId: playbackId,
                    muxAssetId: eventData.id,
                    thumbnailUrl,
                    thumbnailKey,
                    previewUrl,
                    previewKey,
                    duration
                })
                .where(eq(videos.muxUploadId, upload_id))
                .returning();
            return new Response(JSON.stringify(video), { status: 200 });
        }
        // Handle video asset errored event
        case "video.asset.errored": {
            const eventData = payload.data as VideoAssetErroredWebhookEvent["data"];
            const { upload_id } = eventData;
            // Ensure the upload ID is present
            if (!upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }
            // Handle video asset errored event
            const [video] = await db.update(videos)
                .set({
                    muxStatus: eventData.status,
                })
                .where(eq(videos.muxUploadId, upload_id))
                .returning();
            return new Response(JSON.stringify(video), { status: 200 });
        }
        // Handle video asset deleted event
        case "video.asset.deleted": {
            const eventData = payload.data as VideoAssetDeletedWebhookEvent["data"];
            const { upload_id } = eventData;
            // Ensure the upload ID is present
            if (!upload_id) {
                return new Response("Missing upload ID", { status: 400 });
            }
            console.log("Delecting video with upload_id:", upload_id);
            // Handle video asset deleted event
            const [video] = await db.delete(videos)
                .where(eq(videos.muxUploadId, upload_id))
                .returning();
            return new Response(JSON.stringify(video), { status: 200 });
        }
        // Handle video track ready event
        case "video.asset.track.ready": {
            const eventData = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
                // Typescript incorrectly says that asset ID does not exist on VideoAssetTrackReadyWebhookEvent["data"]
                asset_id?: string;
            };
            const { id, asset_id, status } = eventData;
            const track_id = id; // Use id or eventData.id based on your payload structure
            // Ensure the track ID is present     
            console.log("Track ready event received with track ID:", track_id);
            if (!track_id) {
                return new Response("Missing track ID", { status: 400 });
            }
            // Ensure the asset ID is present
            if (!asset_id) {
                return new Response("Missing asset ID", { status: 400 });
            }
            // Handle video track ready event
            const [video] = await db.update(videos)
                .set({
                    muxTrackId: track_id,
                    muxTrackStatus: status,
                })
                .where(eq(videos.muxAssetId, asset_id))
                .returning();
            return new Response(JSON.stringify(video), { status: 200 });
        }

        // default:
        //     console.warn("Unhandled Mux webhook event type:", payload.type);
        //     return new Response("Unhandled event type", { status: 200 });

    }
    return new Response("Webhook processed successfully", { status: 200 });

}