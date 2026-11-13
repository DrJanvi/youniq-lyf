import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppSupportButton } from "@/components/layout/WhatsAppSupportButton";
import { connection } from "next/server";

export const instant = false;

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppSupportButton />
    </>
  );
}
