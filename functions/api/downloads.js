const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Download counter is not configured" }, 503);

  try {
    const row = await env.DB.prepare(
      "SELECT count FROM download_stats WHERE id = 1"
    ).first();

    return json({ count: row?.count ?? 0 });
  } catch {
    return json({ error: "Could not read download count" }, 500);
  }
}

export async function onRequestPost({ env }) {
  if (!env.DB) return json({ error: "Download counter is not configured" }, 503);

  try {
    const row = await env.DB.prepare(
      `INSERT INTO download_stats (id, count)
       VALUES (1, 1)
       ON CONFLICT(id) DO UPDATE SET count = count + 1
       RETURNING count`
    ).first();

    return json({ count: row.count });
  } catch {
    return json({ error: "Could not update download count" }, 500);
  }
}
