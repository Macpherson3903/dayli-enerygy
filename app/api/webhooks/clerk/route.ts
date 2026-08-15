import { verifyWebhook } from "@clerk/nextjs/webhooks";
import {
  recordSessionCreated,
  upsertUserFromClerkUserJson,
} from "@/lib/auth/sync-user";
import { deleteUserByClerkId } from "@/lib/db/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch (e) {
    console.error("[users] Clerk webhook verification failed", e);
    return new Response("Invalid webhook", { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertUserFromClerkUserJson(event.data);
    } else if (event.type === "user.deleted") {
      if (event.data.id) {
        await deleteUserByClerkId(event.data.id);
      }
    } else if (event.type === "session.created") {
      await recordSessionCreated({
        clerkId: event.data.user_id,
        user: event.data.user,
        lastSignInAt: new Date(event.data.created_at),
      });
    }
  } catch (e) {
    console.error("[users] Clerk webhook handler failed", event.type, e);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
