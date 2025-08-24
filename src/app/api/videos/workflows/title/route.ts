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
    const TITLE_SYSTEM_PROMPT = `Generate an SEO-focused single title for a YouTube video base on the content of its ${transcript} that satisfy the following 
    - 4-10 words long and not more than 70 characters. 
    - only return the title as plain text. 
    - Do not add quotes or any additional formatting. 
    - Avoid jargon or overly complex language unless it directly supports searchability.
    - Be concise but descriptive, using relevant keywords to improve discoverability.
    - Highlight the most compelling or unique aspect of the video content.
    - Use action-oriented phrasing or clear value propositions where applicable.`
    // Implement google genai text generation
    // run the third step by generating title
    const title = await context.run(`generate-title`, async () => {
        const { text: newTitle } = await ai.models.generateContent({
            model: `gemini-2.0-flash`,
            contents: TITLE_SYSTEM_PROMPT
        })
        return newTitle
    })
    // check if there is no title
    if (!title) {
        throw new Error(`Bad request`)
    }
    // // run the last step by updating the video
    await context.run("update-video", async () => {
        await db.update(videos).set({
            title: title || video.title
        }).where(and(
            eq(videos.id, video.id),
            eq(videos.userId, video.userId)
        ))
    });
    // const { body } = await context.api.openai.call(
    //     "generate-title",
    //     {
    //         token: process.env.OPENAI_API_KEY!,
    //         operation: `chat.completions.create`,
    //         body: {
    //             model: "gpt-4o",
    //             messages: [
    //                 {
    //                     role: "system",
    //                     content: TITLE_SYSTEM_PROMPT
    //                 },
    //                 {
    //                     role: "user",
    //                     content: `Hi everyone, in this learning project we will be building a youtube clone`
    //                 }
    //             ]
    //         }
    //     }
    // )
    // const title = body.choices[0]?.message.content
});
