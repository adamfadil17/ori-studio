import "server-only";

// The storage implementation lives in `./storage-fs`, which is deliberately free
// of `server-only` so the cron sweeper (`scripts/sweep-uploads.ts`) can import
// it under plain node. This module is the app-facing entry: it re-exports the
// same API and keeps the `server-only` guard, so anything reaching storage
// through `@/lib` still can't be pulled into a client bundle.
export * from "./storage-fs";
