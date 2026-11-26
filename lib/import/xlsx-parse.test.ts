/** npx tsx lib/import/xlsx-parse.test.ts */
import { deflateRawSync } from "node:zlib";
import { parseXlsxBytes, xlsxRowsToCsv } from "./xlsx-parse";
import { parseLotesCsv } from "./lotes-csv";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function zipStore(files: { name: string; content: string }[]): ArrayBuffer {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = new TextEncoder().encode(f.name);
    const data = new TextEncoder().encode(f.content);
    const compressed = deflateRawSync(data);
    const useStore = compressed.length >= data.length;
    const payload = useStore ? data : compressed;
    const method = useStore ? 0 : 8;
    const crc = crc32(data);
    const local = new ArrayBuffer(30 + name.length);
    const lv = new DataView(local);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, method, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, payload.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    const localBytes = new Uint8Array(local);
    localBytes.set(name, 30);
    parts.push(localBytes, payload);

    const cen = new ArrayBuffer(46 + name.length);
    const cv = new DataView(cen);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, method, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, payload.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    const cenBytes = new Uint8Array(cen);
    cenBytes.set(name, 46);
    central.push(cenBytes);
    offset += localBytes.length + payload.length;
  }
  const centralStart = offset;
  for (const c of central) {
    parts.push(c);
    offset += c.length;
  }
  const end = new ArrayBuffer(22);
  const ev = new DataView(end);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, offset - centralStart, true);
  ev.setUint32(16, centralStart, true);
  parts.push(new Uint8Array(end));

  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out.buffer;
}

const shared = `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="4" uniqueCount="4">
<si><t>quadra</t></si><si><t>lote</t></si><si><t>area</t></si><si><t>situacao</t></si>
</sst>`;

const sheet = `<?xml version="1.0"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>
<row r="1">
<c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c>
<c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c>
</row>
<row r="2">
<c r="A2" t="inlineStr"><is><t>A</t></is></c>
<c r="B2" t="inlineStr"><is><t>01</t></is></c>
<c r="C2"><v>250</v></c>
<c r="D2" t="inlineStr"><is><t>disponivel</t></is></c>
</row>
</sheetData>
</worksheet>`;

async function main() {
  const buf = zipStore([
    { name: "xl/sharedStrings.xml", content: shared },
    { name: "xl/worksheets/sheet1.xml", content: sheet },
  ]);

  const parsed = await parseXlsxBytes(buf);
  assert(parsed.ok, parsed.erro ?? "parse fail");
  assert(parsed.rows.length === 2, `rows ${parsed.rows.length}`);
  assert(parsed.rows[0][0] === "quadra", "header");
  assert(parsed.rows[1][2] === "250", "area");

  const csv = xlsxRowsToCsv(parsed.rows);
  const preview = parseLotesCsv(csv);
  assert(preview.ok, "lotes from xlsx");
  assert(preview.criaveis === 1, "1 lote");

  console.log("ok: xlsx-parse");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
