import { existsSync } from "fs";
import path from "path";

/** True when a path under /public exists (server-only). */
export function publicFileExists(publicPath: string) {
  const rel = publicPath.replace(/^\//, "");
  return existsSync(path.join(process.cwd(), "public", rel));
}
