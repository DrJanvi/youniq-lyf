import { AccountLogoutButton } from "@/components/shop/AccountLogoutButton";
import { AccountNavigation, type AccountSection } from "@/components/shop/AccountNavigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export function AccountShell({
  active,
  children,
}: {
  active: AccountSection;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ name: "Home", href: "/" }, { name: "My Account", href: "/account" }]}
        className="bg-[#f8f8f8]"
      />
      <section className="bg-[#f8f8f8] pb-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5 lg:px-8">
          <aside className="h-fit rounded-2xl bg-white p-5 sm:p-7">
            <h1 className="font-cormorant mb-4 text-center text-2xl font-semibold text-brand-espresso">
              My Account
            </h1>
            <AccountNavigation active={active} />
            <div className="mt-3 border-t border-surface-border pt-4">
              <AccountLogoutButton />
            </div>
          </aside>
          <main className="min-w-0 rounded-2xl bg-white p-3 sm:p-4">{children}</main>
        </div>
      </section>
    </>
  );
}

export function AccountPlaceholder({ title }: { title: string }) {
  return (
    <section className="rounded-xl bg-[#f6f6f6] p-5 sm:p-7">
      <h2 className="rounded-lg bg-white px-4 py-3 text-lg font-medium text-text-primary">
        {title}
      </h2>
      <p className="mt-4 rounded-lg bg-white p-5 text-sm leading-6 text-text-muted">
        This section is being prepared. Its design and functionality will be added soon.
      </p>
    </section>
  );
}
