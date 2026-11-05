export const ACCOUNT_DELETION_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

export function getAccountRecoveryDeadline(requestedAt: Date) {
  return new Date(requestedAt.getTime() + ACCOUNT_DELETION_GRACE_MS);
}
