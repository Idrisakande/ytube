import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/ratelimit';

export const createTRPCContext = cache(async () => {
    const {userId} = await auth()
    return {
        // Add any context you need here
        clerkUserId: userId
    };
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

export const t = initTRPC.context<Context>().create({
    transformer: superjson,
    // errorFormatter({ shape }) {
    //     return shape;
    // },
    // isDev: process.env.NODE_ENV === 'development',
    // transformer: cache(() => import('superjson').then((mod) => mod.default)),
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
// export const middleware = t.middleware;
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
    const { ctx } = opts

    if (!ctx.clerkUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to access this resource" })
    }
    // get user from the data base
    // if user is not found, unauthorized
    // also return user
    const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId)).limit(1)
    if (!user) {
        throw new TRPCError({code: "UNAUTHORIZED", message: "User not found"})
    }
    const {success} = await rateLimit.limit(user.id)
    if (!success) {
        throw new TRPCError({code: "TOO_MANY_REQUESTS", message: "You have exceeded the rate limit"})
    }
    // if user is found, return the user
    // and continue to the next middleware or procedure

    return opts.next({
        ctx: {
            ...ctx,
            user
        }
    })
})