/** Local snapshots are a development/test aid, never a deployed data source. */
export function allowsCatalogSnapshotFallback(
  vercelEnvironment = process.env.VERCEL_ENV,
) {
  return !vercelEnvironment || vercelEnvironment === "development";
}
