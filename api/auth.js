import { isValidAdminPassword, jsonResponse } from "./_blob.js";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";
    if (!isValidAdminPassword(password)) {
      return jsonResponse({ ok: false, error: "Mật khẩu quản trị không đúng." }, 401);
    }
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("[api/auth] POST error:", err);
    return jsonResponse({ ok: false, error: "Lỗi xác thực máy chủ." }, 500);
  }
}
