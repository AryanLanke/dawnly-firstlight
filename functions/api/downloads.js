import { json, isSameOriginWrite } from "../../server/http.js";
import { getCount, incrementCount } from "../../server/download-stats.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Download counter is not configured" }, 503);

  try {
    return json({ count: await getCount(env.DB) });
  } catch (error) {
    console.error("Could not read download count", error);
    return json({ error: "Could not read download count" }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!isSameOriginWrite(request)) return json({ error: "Forbidden" }, 403);
  if (!env.DB) return json({ error: "Download counter is not configured" }, 503);

  try {
    return json({ count: await incrementCount(env.DB) });
  } catch (error) {
    console.error("Could not update download count", error);
    return json({ error: "Could not update download count" }, 500);
  }
}
