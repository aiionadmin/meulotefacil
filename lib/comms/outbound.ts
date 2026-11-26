/** Canais de saída no card do cliente (WhatsApp / e-mail / telefone) — stub de app. */

export type OutboundCanal = "whatsapp" | "email" | "telefone";

export function digitsPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = digitsPhone(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(
  email: string,
  subject: string,
  body: string
): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildTelLink(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return `tel:+${digitsPhone(d)}`;
}

export function defaultOutboundMessage(
  canal: OutboundCanal,
  cliente: string
): string {
  if (canal === "email") {
    return `Olá ${cliente},\n\nEntramos em contato pelo Meu Lote Fácil.\n\nAtenciosamente,`;
  }
  return `Olá ${cliente}, tudo bem? Aqui é da equipe Meu Lote Fácil.`;
}
