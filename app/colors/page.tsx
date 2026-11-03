import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Tokens",
  robots: { index: false, follow: false },
};

type Swatch = { name: string; hex: string; bg: string; text: string };

// Class names are written out in full so Tailwind can detect them.
const groups: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Brand & Accents",
    swatches: [
      {
        name: "brand-taupe",
        hex: "#B49084",
        bg: "bg-brand-taupe",
        text: "text-brand-taupe",
      },
      {
        name: "brand-taupe-dark",
        hex: "#7D6154",
        bg: "bg-brand-taupe-dark",
        text: "text-brand-taupe-dark",
      },
      {
        name: "brand-espresso",
        hex: "#3C2A21",
        bg: "bg-brand-espresso",
        text: "text-brand-espresso",
      },
      {
        name: "badge-sale",
        hex: "#F6E8E3",
        bg: "bg-badge-sale",
        text: "text-badge-sale",
      },
      {
        name: "badge-sale-text",
        hex: "#A7362A",
        bg: "bg-badge-sale-text",
        text: "text-badge-sale-text",
      },
      {
        name: "rating-gold",
        hex: "#D9822B",
        bg: "bg-rating-gold",
        text: "text-rating-gold",
      },
    ],
  },
  {
    title: "Surfaces & Borders",
    swatches: [
      {
        name: "surface-main",
        hex: "#FFFFFF",
        bg: "bg-surface-main",
        text: "text-surface-main",
      },
      {
        name: "surface-card",
        hex: "#F6F6F6",
        bg: "bg-surface-card",
        text: "text-surface-card",
      },
      {
        name: "surface-border",
        hex: "#ECECEC",
        bg: "bg-surface-border",
        text: "text-surface-border",
      },
    ],
  },
  {
    title: "Announcement Bar",
    swatches: [
      {
        name: "announcement-bg",
        hex: "#1C1C1C",
        bg: "bg-announcement-bg",
        text: "text-announcement-bg",
      },
      {
        name: "announcement-text",
        hex: "#FFFFFF",
        bg: "bg-announcement-text",
        text: "text-announcement-text",
      },
    ],
  },
  {
    title: "Typography / Content",
    swatches: [
      {
        name: "text-primary",
        hex: "#1E1E1E",
        bg: "bg-text-primary",
        text: "text-text-primary",
      },
      {
        name: "text-muted",
        hex: "#848484",
        bg: "bg-text-muted",
        text: "text-text-muted",
      },
      {
        name: "text-strike",
        hex: "#A3A3A3",
        bg: "bg-text-strike",
        text: "text-text-strike",
      },
    ],
  },
];

export default function ColorsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="font-cormorant text-brand-espresso text-4xl font-semibold">
        Color Tokens
      </h1>
      <p className="text-text-muted mt-2">
        Design tokens registered in <code>@theme</code> in{" "}
        <code>app/globals.css</code>.
      </p>

      <div className="bg-announcement-bg text-announcement-text mt-6 flex items-center justify-center px-4 py-2 text-sm">
        Announcement bar preview
      </div>

      {groups.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="text-text-primary mb-4 text-lg font-semibold">
            {group.title}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.swatches.map((s) => (
              <div
                key={s.name}
                className="border-surface-border bg-surface-card overflow-hidden rounded-lg border"
              >
                <div
                  className={`border-surface-border h-24 border-b ${s.bg}`}
                />
                <div className="p-3 text-sm">
                  <p className="text-text-primary font-medium">
                    --color-{s.name}
                  </p>
                  <p className="text-text-muted">{s.hex}</p>
                  <p className="text-text-muted mt-1 text-xs">
                    <code>{s.bg}</code> · <code>{s.text}</code>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="text-text-primary mb-4 text-lg font-semibold">
          In context
        </h2>
        <div className="border-surface-border bg-surface-card max-w-xs rounded-lg border p-4">
          <span className="bg-badge-sale rounded px-2 py-0.5 text-xs text-white">
            Sale
          </span>
          <h3 className="text-brand-espresso mt-3 font-medium">
            Oud Noir Eau de Parfum
          </h3>
          <p className="text-rating-gold">★★★★☆</p>
          <p className="mt-1">
            <span className="text-text-primary font-semibold">$80</span>{" "}
            <span className="text-text-strike line-through">$100</span>
          </p>
          <button className="bg-brand-taupe hover:bg-brand-taupe-dark mt-3 rounded px-4 py-2 text-sm text-white">
            Add to cart
          </button>
        </div>
      </section>
    </main>
  );
}
