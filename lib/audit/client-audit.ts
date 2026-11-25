"use client";

import type { AuditWriteInput } from "./types";

/** Envia evento de auditoria ao servidor (A05). Falha silenciosa em demo offline. */
export async function recordAudit(
  input: Omit<AuditWriteInput, "organizationId"> & {
    organizationId?: string;
  }
) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    /* offline / demo sem API */
  }
}
