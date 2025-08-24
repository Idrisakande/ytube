// http://localhost:3000/api/videos/workflows/title

import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { ai } from "@/lib/google-genai";

interface InputType {
    userId: string
    videoId: string
}

// serve endpoint which expects a string payload:
export const { POST } = serve<InputType>(async (context) => {
    // get request body:
    const input = context.requestPayload;
    const { userId, videoId } = input
    // run the first step: by getting the video
    const video = await context.run("get-one-video", async () => {
        const [existingVideo] = await db.select().from(videos)
            .where(and(
                eq(videos.id, videoId),
                eq(videos.userId, userId)
            ))
        if (!existingVideo) {
            throw new Error("Not found")
        }
        return existingVideo
    });
    // run the second step by generating transcript
    const transcript = await context.run(`get-transcript`, async () => {
        const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`
        const response = await fetch(trackUrl)
        const text = response.text()
        // check if there is text
        if (!text) {
            throw new Error(`Bad request`)
        }
        return text
    })
    // write a description prompt for the content
    const DESCRIPTION_SYSTEM_PROMPT = `Generate a summarized video base on the content of its ${transcript} that satisfy the following 
    - Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
    - Aim for a summary that is 3-5 sentences long and no more than 200 characters.
    - Only return the summary, no other text, annotations, or comments.
    - Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
    - Do not add quotes or any additional formatting. 
    - Avoid jargon or overly complex language unless necessary for the context.
    - Highlight the most compelling or unique aspect of the video content.
    - Use action-oriented phrasing or clear value propositions where applicable.`
    // Implement google genai for "description" generation
    // run the third step by generating description
    const description = await context.run(`generate-description`, async () => {
        const { text: newDescription } = await ai.models.generateContent({
            model: `gemini-2.0-flash`,
            contents: DESCRIPTION_SYSTEM_PROMPT
        })
        return newDescription
    })
    // check if there is no description
    if (!description) {
        throw new Error(`Bad request`)
    }
    // // run the last step by updating the video
    await context.run("update-video", async () => {
        await db.update(videos).set({
            description: description || video.description
        }).where(and(
            eq(videos.id, video.id),
            eq(videos.userId, video.userId)
        ))
    });
});
