/**
 * Leitura mínima de ZIP (só Deflate / Store) para OOXML .xlsx.
 * Browser: DecompressionStream; Node: zlib.inflateRawSync.
 */

export type ZipEntry = { name: string; data: Uint8Array };

function u16(v: DataView, o: number) {
  return v.getUint16(o, true);
}
function u32(v: DataView, o: number) {
  return v.getUint32(o, true);
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== "undefined") {
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(ds);
    const buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }
  // Node (testes)
  const zlib = await import("node:zlib");
  return zlib.inflateRawSync(data);
}

export async function readZip(buf: ArrayBuffer): Promise<ZipEntry[]> {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  const entries: ZipEntry[] = [];
  let o = 0;
  while (o + 30 <= bytes.length) {
    const sig = u32(view, o);
    if (sig !== 0x04034b50) break; // local file header
    const method = u16(view, o + 8);
    const compSize = u32(view, o + 18);
    const nameLen = u16(view, o + 26);
    const extraLen = u16(view, o + 28);
    const name = new TextDecoder("utf-8").decode(
      bytes.subarray(o + 30, o + 30 + nameLen)
    );
    const dataStart = o + 30 + nameLen + extraLen;
    const compressed = bytes.subarray(dataStart, dataStart + compSize);
    let data: Uint8Array;
    if (method === 0) {
      data = compressed;
    } else if (method === 8) {
      data = await inflateRaw(compressed);
    } else {
      o = dataStart + compSize;
      continue;
    }
    entries.push({ name, data });
    o = dataStart + compSize;
  }
  return entries;
}

export function entryText(entries: ZipEntry[], path: string): string | null {
  const e = entries.find((x) => x.name === path);
  if (!e) return null;
  return new TextDecoder("utf-8").decode(e.data);
}
