import { parsePagedQuery, pagedJson } from "./paged";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const url = new URL("http://x/api?page=2&pageSize=10&q=ana");
const q = parsePagedQuery(url);
assert(q.page === 2, "page");
assert(q.pageSize === 10, "size");
assert(q.q === "ana", "q");

const items = Array.from({ length: 25 }, (_, i) => ({ id: i }));
const body = pagedJson(items, { page: 2, pageSize: 10, q: "" }, performance.now());
assert(body.items.length === 10, "slice");
assert(body.page === 2, "page body");
assert(body.total === 25, "total");
assert(body.totalPages === 3, "pages");

console.log("ok: paged api");
