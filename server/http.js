const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

// True only when the request's Origin header is this site's origin.
// Browsers send Origin on every POST, so a missing header means a non-browser
// client (curl, scripts) and is treated as untrusted for writes.
export function isSameOriginWrite(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
