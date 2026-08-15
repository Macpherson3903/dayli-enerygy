import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { normalizeRole } from "@/lib/auth/roles";
import {
  countUsers,
  insertUserIfMissing,
  touchUserLastSignIn,
  upsertUser,
  upsertUsers,
  type UserRecordInput,
} from "@/lib/db/users";

type ClerkUserLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata?: unknown;
  createdAt: number;
  lastSignInAt?: number | null;
};

export type ClerkUserJsonLike = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  primary_email_address_id: string | null;
  email_addresses: Array<{ id: string; email_address: string }>;
  public_metadata?: unknown;
  created_at: number;
  last_sign_in_at: number | null;
};

function metadataRole(metadata: unknown): unknown {
  if (!metadata || typeof metadata !== "object") return undefined;
  return (metadata as { role?: unknown }).role;
}

function emailFromClerkUser(user: ClerkUserLike): string {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  );
}

function emailFromClerkUserJson(user: ClerkUserJsonLike): string {
  const primary = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id
  );
  return primary?.email_address ?? user.email_addresses[0]?.email_address ?? "";
}

function msToDate(value: number | null | undefined): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return new Date(value);
}

export function userRecordFromClerkUser(user: ClerkUserLike): UserRecordInput {
  return {
    clerkId: user.id,
    email: emailFromClerkUser(user),
    firstName: user.firstName?.trim() ?? "",
    lastName: user.lastName?.trim() ?? "",
    role: normalizeRole(metadataRole(user.publicMetadata)),
    lastSignInAt: msToDate(user.lastSignInAt),
    createdAt: msToDate(user.createdAt) ?? new Date(),
  };
}

export function userRecordFromClerkUserJson(
  user: ClerkUserJsonLike
): UserRecordInput {
  return {
    clerkId: user.id,
    email: emailFromClerkUserJson(user),
    firstName: user.first_name?.trim() ?? "",
    lastName: user.last_name?.trim() ?? "",
    role: normalizeRole(metadataRole(user.public_metadata)),
    lastSignInAt: msToDate(user.last_sign_in_at),
    createdAt: msToDate(user.created_at) ?? new Date(),
  };
}

export async function upsertUserFromClerkUser(user: ClerkUserLike): Promise<void> {
  await upsertUser(userRecordFromClerkUser(user));
}

export async function upsertUserFromClerkUserJson(
  user: ClerkUserJsonLike
): Promise<void> {
  await upsertUser(userRecordFromClerkUserJson(user));
}

/** Insert the signed-in Clerk user if they are not in Mongo yet. Does not update existing rows. */
export async function ensureCurrentUserInDb(): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  try {
    await insertUserIfMissing(userRecordFromClerkUser(user));
  } catch (e) {
    console.error("[users] Failed to store signed-in user in MongoDB", e);
  }
}

export async function recordSessionCreated(input: {
  clerkId: string;
  user?: ClerkUserJsonLike | null;
  lastSignInAt?: Date;
}): Promise<void> {
  const lastSignInAt = input.lastSignInAt ?? new Date();
  const touched = await touchUserLastSignIn(input.clerkId, lastSignInAt);
  if (touched) return;

  if (input.user) {
    await upsertUser({
      ...userRecordFromClerkUserJson(input.user),
      lastSignInAt,
    });
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(input.clerkId);
  await upsertUser({
    ...userRecordFromClerkUser(user),
    lastSignInAt,
  });
}

export async function syncAllUsersFromClerk(): Promise<{ synced: number }> {
  const client = await clerkClient();
  const pageSize = 100;
  let offset = 0;
  let synced = 0;

  for (;;) {
    const page = await client.users.getUserList({
      limit: pageSize,
      offset,
      orderBy: "-created_at",
    });
    await upsertUsers(page.data.map(userRecordFromClerkUser));
    synced += page.data.length;
    if (page.data.length < pageSize) break;
    offset += pageSize;
    if (offset > 10_000) break;
  }

  return { synced };
}

export async function backfillUsersFromClerkIfEmpty(): Promise<number> {
  const existing = await countUsers();
  if (existing > 0) return 0;
  try {
    const { synced } = await syncAllUsersFromClerk();
    return synced;
  } catch (e) {
    console.error("[users] Clerk backfill failed", e);
    return 0;
  }
}
