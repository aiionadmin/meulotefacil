import {
  buildMailtoLink,
  buildTelLink,
  buildWhatsAppLink,
  defaultOutboundMessage,
  digitsPhone,
} from "./outbound";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(digitsPhone("11999998888") === "5511999998888", "digits");
assert(
  buildWhatsAppLink("11999998888", "oi").startsWith("https://wa.me/5511999998888"),
  "wa"
);
assert(buildMailtoLink("a@b.com", "Assunto", "corpo").includes("mailto:"), "mail");
assert(buildTelLink("11999998888").startsWith("tel:+"), "tel");
assert(defaultOutboundMessage("whatsapp", "Ana").includes("Ana"), "msg");

console.log("ok: outbound");
