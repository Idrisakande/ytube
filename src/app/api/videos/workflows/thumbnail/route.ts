// http://localhost:3000/api/videos/workflows/title

import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
// import { ai } from "@/lib/google-genai";
// import * as fs from "node:fs";
import { replicate } from "@/lib/replicate";

interface InputType {
    userId: string
    videoId: string
    prompt: string
}

// serve endpoint which expects a string payload:
export const { POST } = serve<InputType>(async (context) => {
    // get request body:
    const input = context.requestPayload;
    const { userId, videoId, prompt } = input
    // run the first step: by getting the video
    // const video = 
    await context.run("get-one-video", async () => {
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
    // Implement google genai image generation
    // run the third step by generating image
    // const generatedBase64Image = 
    // await context.run(`image-generation`, async () => {
    //     const response = await ai.models.generateImages({
    //         model: 'imagen-4.0-generate-preview-06-06',
    //         prompt: prompt,
    //         config: {
    //             numberOfImages: 1,
    //         },
    //     });
    //     if (!response.generatedImages || response.generatedImages.length === 0) {
    //         throw new Error("No images generated");
    //     }
    //     const generatedImage = response.generatedImages[0];
    //     const imgBytes = generatedImage?.image?.imageBytes;

    //     let generatedImageBase64: string | null = null;
    //     if (imgBytes) {
    //         // Store the imageBytes in a variable accessible outside the run context
    //         generatedImageBase64 = imgBytes;
    //         // Optional: Save the image to a file system (useful for debugging or local storage)
    //         const newBuffer = Buffer.from(imgBytes, "base64");
    //         fs.writeFileSync(`imagen-${video.id}.png`, newBuffer); // Use videoId for unique filenames
    //     } else {
    //         throw new Error("Image bytes not found in the response.");
    //     }
    //     return generatedImageBase64
    // });
    await context.run(`image-generation`, async () => {
        const output = await replicate.run(
            "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
            {
                input: {
                    prompt: prompt,
                    // width: 512,
                    // height: 512,
                    num_outputs: 1,
                },

            }
        );

        // The output is an array of image URLs
        const imageUrl = output;
        console.log(imageUrl);


        // Fetch the image and convert to base64
        // const response = await fetch(imageUrl);
        // const buffer = await response.arrayBuffer();
        // const base64 = Buffer.from(buffer).toString('base64');

        // return `data:image/png;base64,${base64}`;
    });
}
    // context.run(`image-generation`, async () => {
    //     const response = await ai.models.generateImages({
    //         model: 'imagen-4.0-generate-preview-06-06',
    //         prompt: prompt,
    //         config: {
    //             numberOfImages: 1,
    //         },
    //     });
    //     if (!response.generatedImages) {
    //         throw new Error("Not found")
    //     }
    //     let idx = 1;
    //     for (const generatedImage of response.generatedImages) {
    //         const imgBytes = generatedImage?.image?.imageBytes;
    //         const newBuffer = Buffer.from(imgBytes!, "base64");
    //         fs.writeFileSync(`imagen-${idx}.png`, newBuffer);
    //         idx++;
    //     }
    //     console.log({
    //         imagebeit: response?.generatedImages?.[0]?.image?.imageBytes,
    //         prompt,
    //         video
    //     });
    // })

    // const title = await context.run(`generate-title`, async () => {
    //     const { text: newTitle } = await ai.models.generateContent({
    //         model: `gemini-2.0-flash`,
    //         contents: TITLE_SYSTEM_PROMPT
    //     })
    //     return newTitle
    // })
    // // check if there is no title
    // if (!title) {
    //     throw new Error(`Bad request`)
    // }
    // // // run the last step by updating the video
    // await context.run("update-video", async () => {
    //     await db.update(videos).set({
    //         title: title || video.title
    //     }).where(and(
    //         eq(videos.id, video.id),
    //         eq(videos.userId, video.userId)
    //     ))
    // });
);
