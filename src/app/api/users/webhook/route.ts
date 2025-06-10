import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"


export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET
    // const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET || ""

    if (!SIGNING_SECRET) {
        // return new Response("SVIX_CLERK_SIGNING_SECRET is not set", { status: 500 })
        throw new Error("ERROR: SVIX_CLERK_SIGNING_SECRET is not set from clerk Dashboard to .env or .env.local")
    }
    // create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET)
    // get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")
    // const headerPayload = await headers()
    // const svix_id = headerPayload.get("svix-id") || ""
    // const svix_timestamp = headerPayload.get("svix-timestamp") || ""
    // const svix_signature = headerPayload.get("svix-signature") || ""
    // if headers are not set or error out, return 400
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error: Missing Svix headers", { status: 400 })
    }
    // get body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    let event: WebhookEvent
    // verify the webhook
    try {
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (error) {
        console.error("Error verifying webhook:", error)
        return new Response("Error: Verifying webhook", { status: 400 })
    }
    //  do nsomething with the event payload

    // console.log("Webhook event payload", body)
    const eventType = event.type
    // check if event is a user event
    if (eventType === "user.created") {
        // handle user created event
        // you can use the data object to get the user id and other information
        // for example, you can use the user id to create a new user in your database
        // or send a welcome email to the user
        // or send a notification to the user
        const { data } = event
        await db.insert(users).values({
            clerkId: data.id,
            email: data.email_addresses[0].email_address,
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url,
        })
        console.log("User created:", event.data)
    }
    if (event.type === "user.deleted") {
        // handle user deleted event
        const { data } = event
        if (!data.id) {
            return new Response("Missing user id", { status: 400 })
        }
        await db.delete(users).where(eq(users.clerkId, data.id))
        console.log("User deleted:", event.data)
    }
    if (eventType === "user.updated") {
        // handle user updated event
        const { data } = event
        await db.update(users).set({
            name: `${data.first_name} ${data.last_name}`,
            imageUrl: data.image_url,
        })
        console.log("User updated:", event.data)
    }
    // else {
    //     console.log("Unknown event type:", event.type)
    // }

    // return 200
    return new Response("Webhook received", { status: 200 })
}