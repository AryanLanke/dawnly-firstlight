// The whole counter is a single row (id = 1) in the download_stats table.

export async function getCount(db) {
  const row = await db.prepare("SELECT count FROM download_stats WHERE id = 1").first();
  return row?.count ?? 0;
}

export async function incrementCount(db) {
  const row = await db
    .prepare(
      `INSERT INTO download_stats (id, count)
       VALUES (1, 1)
       ON CONFLICT(id) DO UPDATE SET count = count + 1
       RETURNING count`
    )
    .first();
  return row.count;
}
