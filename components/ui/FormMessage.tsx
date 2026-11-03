export function FormMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p role="alert">{error}</p>;
  if (success) return <p role="status">{success}</p>;
  return null;
}
