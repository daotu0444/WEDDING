import {
  readJsonBlob,
  writeJsonBlob,
  verifyAdminRequest,
  jsonResponse,
} from "./_blob.js";

const RSVPS_PATH = "wedding/rsvps.json";
const WISHES_PATH = "wedding/wishes.json";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("public") === "wishes") {
      const wishes = (await readJsonBlob(WISHES_PATH)) || [];
      return jsonResponse({ ok: true, wishes: Array.isArray(wishes) ? wishes : [] });
    }

    if (!verifyAdminRequest(request)) {
      return jsonResponse({ ok: false, error: "Chưa xác thực mật khẩu quản trị." }, 401);
    }

    const [rsvps, wishes] = await Promise.all([
      readJsonBlob(RSVPS_PATH),
      readJsonBlob(WISHES_PATH),
    ]);
    return jsonResponse({
      ok: true,
      rsvps: Array.isArray(rsvps) ? rsvps : [],
      wishes: Array.isArray(wishes) ? wishes : [],
    });
  } catch (err) {
    console.error("[api/guests] GET error:", err);
    return jsonResponse({ ok: false, error: "Không thể tải danh sách phản hồi." }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const type = body?.type;

    if (type === "rsvp") {
      const name = String(body.name || "").trim().slice(0, 120);
      if (!name) {
        return jsonResponse({ ok: false, error: "Vui lòng nhập tên khách mời." }, 400);
      }
      const status = body.status === "declining" ? "declining" : "attending";
      const guests = status === "attending" ? Math.max(1, Math.min(20, Number(body.guests) || 1)) : 0;
      const item = {
        id: String(body.id || Date.now()),
        templateId: String(body.templateId || "").slice(0, 80),
        name,
        status,
        guests,
        note: String(body.note || "").trim().slice(0, 500),
        createdAt: body.createdAt || new Date().toISOString(),
      };
      const existing = (await readJsonBlob(RSVPS_PATH)) || [];
      const list = Array.isArray(existing) ? existing : [];
      list.unshift(item);
      await writeJsonBlob(RSVPS_PATH, list.slice(0, 1000));
      return jsonResponse({ ok: true, item });
    }

    if (type === "wish") {
      const name = String(body.name || "").trim().slice(0, 120);
      const message = String(body.message || "").trim().slice(0, 1000);
      if (!name || !message) {
        return jsonResponse({ ok: false, error: "Vui lòng nhập tên và lời chúc." }, 400);
      }
      const item = {
        id: String(body.id || Date.now()),
        templateId: String(body.templateId || "").slice(0, 80),
        name,
        message,
        time: String(body.time || "").slice(0, 60),
      };
      const existing = (await readJsonBlob(WISHES_PATH)) || [];
      const list = Array.isArray(existing) ? existing : [];
      list.unshift(item);
      await writeJsonBlob(WISHES_PATH, list.slice(0, 1000));
      return jsonResponse({ ok: true, item });
    }

    return jsonResponse({ ok: false, error: "Loại dữ liệu không hợp lệ." }, 400);
  } catch (err) {
    console.error("[api/guests] POST error:", err);
    return jsonResponse({ ok: false, error: "Không thể lưu phản hồi lên máy chủ." }, 500);
  }
}

export async function DELETE(request) {
  if (!verifyAdminRequest(request)) {
    return jsonResponse({ ok: false, error: "Chưa xác thực mật khẩu quản trị." }, 401);
  }

  try {
    const body = await request.json();
    const type = body?.type;
    const id = String(body?.id || "");
    if (!id || (type !== "rsvp" && type !== "wish")) {
      return jsonResponse({ ok: false, error: "Thiếu thông tin mục cần xóa." }, 400);
    }

    const path = type === "rsvp" ? RSVPS_PATH : WISHES_PATH;
    const existing = (await readJsonBlob(path)) || [];
    const list = Array.isArray(existing) ? existing : [];
    const next = list.filter((item) => String(item.id || "") !== id);
    await writeJsonBlob(path, next);
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("[api/guests] DELETE error:", err);
    return jsonResponse({ ok: false, error: "Không thể xóa mục trên máy chủ." }, 500);
  }
}
