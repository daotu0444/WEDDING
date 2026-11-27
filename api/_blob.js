import crypto from "node:crypto";
import { get, put, del } from "@vercel/blob";

export function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export function isValidAdminPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || typeof candidate !== "string") return false;
  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyAdminRequest(request) {
  const password = request.headers.get("x-admin-password") || "";
  return isValidAdminPassword(password);
}

export async function readJsonBlob(pathname) {
  try {
    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }
    return await new Response(result.stream).json();
  } catch (err) {
    if (err && (err.name === "BlobNotFoundError" || err.statusCode === 404)) {
      return null;
    }
    console.error(`[blob] readJsonBlob failed for ${pathname}:`, err);
    throw err;
  }
}

export async function writeJsonBlob(pathname, data) {
  return put(pathname, JSON.stringify(data), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
  });
}

export async function deleteBlob(pathname) {
  try {
    await del(pathname);
  } catch (err) {
    if (err && (err.name === "BlobNotFoundError" || err.statusCode === 404)) {
      return;
    }
    console.error(`[blob] deleteBlob failed for ${pathname}:`, err);
    throw err;
  }
}
