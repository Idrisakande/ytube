import { db } from "@/db"
import { videos } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user

        const [video] = await db.insert(videos)
            .values({
                userId,
                title: "Untitled",
                url: "sjhs/sJIHSDFHSF", // Provide a default or actual URL
                thumbnailUrl: "HJDFJ/S/FDSIIDS", // Provide a default or actual thumbnail URL
            })
            .returning()
        return { video: video }
    })
})