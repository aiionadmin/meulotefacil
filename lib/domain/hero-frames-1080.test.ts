/** npx tsx lib/domain/hero-frames-1080.test.ts */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  HERO_FRAME_CONFIG,
  HERO_FRAME_HEIGHT,
  HERO_FRAME_WIDTH,
} from "@/components/hero/heroSteps";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

assert(HERO_FRAME_WIDTH === 1920, "largura 1920");
assert(HERO_FRAME_HEIGHT === 1080, "altura 1080");
assert(HERO_FRAME_CONFIG.width === 1920, "config width");
assert(HERO_FRAME_CONFIG.height === 1080, "config height");

/** Lê dimensões VP8X/VP8L do WebP (simplificado para RGB lossy). */
function webpSize(path: string): { w: number; h: number } {
  const buf = readFileSync(path);
  assert(buf.toString("ascii", 0, 4) === "RIFF", `RIFF ${path}`);
  assert(buf.toString("ascii", 8, 12) === "WEBP", `WEBP ${path}`);
  // VP8 chunk after header
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8 ") {
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return { w, h };
  }
  if (fourcc === "VP8X") {
    const w = 1 + buf.readUIntLE(24, 3);
    const h = 1 + buf.readUIntLE(27, 3);
    return { w, h };
  }
  throw new Error(`chunk ${fourcc} em ${path}`);
}

const root = join(process.cwd(), "public/hero-frames");
for (const rel of [
  "frame_0001.webp",
  "frame_0120.webp",
  "poster.webp",
  "mobile/frame_0001.webp",
  "mobile/frame_0072.webp",
]) {
  const { w, h } = webpSize(join(root, rel));
  assert(w === 1920 && h === 1080, `${rel} = ${w}x${h}`);
}

console.log("OK hero-frames-1080", {
  w: HERO_FRAME_WIDTH,
  h: HERO_FRAME_HEIGHT,
  desktop: HERO_FRAME_CONFIG.desktop.count,
  mobile: HERO_FRAME_CONFIG.mobile.count,
});
