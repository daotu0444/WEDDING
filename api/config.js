import {
  readJsonBlob,
  writeJsonBlob,
  deleteBlob,
  verifyAdminRequest,
  jsonResponse,
} from "./_blob.js";

const STORE_PATH = "wedding/store.json";

export async function GET() {
  try {
    const store = await readJsonBlob(STORE_PATH);
    return jsonResponse({ ok: true, store: store || null });
  } catch (err) {
    console.error("[api/config] GET error:", err);
    return jsonResponse({ ok: false, error: "Không thể đọc cấu hình từ máy chủ." }, 500);
  }
}

export async function POST(request) {
  if (!verifyAdminRequest(request)) {
    return jsonResponse({ ok: false, error: "Chưa xác thực mật khẩu quản trị." }, 401);
  }

  try {
    const body = await request.json();
    const store = body?.store;
    if (!store || !Array.isArray(store.templates) || store.templates.length === 0) {
      return jsonResponse({ ok: false, error: "Dữ liệu mẫu thiệp không hợp lệ." }, 400);
    }

    await writeJsonBlob(STORE_PATH, {
      activeTemplateId: String(store.activeTemplateId || store.templates[0].id || ""),
      templates: store.templates,
      updatedAt: new Date().toISOString(),
    });

    return jsonResponse({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[api/config] POST error:", err);
    return jsonResponse({ ok: false, error: "Không thể lưu cấu hình lên đám mây." }, 500);
  }
}

export async function DELETE(request) {
  if (!verifyAdminRequest(request)) {
    return jsonResponse({ ok: false, error: "Chưa xác thực mật khẩu quản trị." }, 401);
  }

  try {
    await deleteBlob(STORE_PATH);
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("[api/config] DELETE error:", err);
    return jsonResponse({ ok: false, error: "Không thể khôi phục cấu hình mặc định." }, 500);
  }
}
