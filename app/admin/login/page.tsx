import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/forms/AdminLoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const instant = false;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ loggedOut?: string | string[] }>;
}) {
  const params = await searchParams;
  const loggedOut = Array.isArray(params.loggedOut)
    ? params.loggedOut[0] === "1"
    : params.loggedOut === "1";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-heading text-3xl font-bold">Admin sign in</CardTitle>
          <CardDescription>Enter your credentials to manage the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm clearOnMount={loggedOut} />
        </CardContent>
      </Card>
    </main>
  );
}
