import { prisma } from "./prisma";

type AuditParams = {
  action: string;
  actorId?: string | null;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        actorId: params.actorId ?? null,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null
      }
    });
  } catch (error) {
    // Avoid blocking auth flows on audit logging failures.
    console.warn("[audit] Failed to write audit log", error);
  }
}
