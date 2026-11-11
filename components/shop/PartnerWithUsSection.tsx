import { AstroidIcon } from "lucide-react";
import { Section } from "../ui/Section";
import { PartnerRequestDialog } from "./PartnerRequestDialog";

export function PartnerWithUsSection() {
  const title = "Partner with Us";
  const subTitle = "Grow Together.";
  const description =
    "Whether you're a retailer looking to bring Youniq bags and accessories to your customers or a creator who loves personal style, we'd love to hear from you.";

  return (
    <Section
      className="relative flex min-h-137.5 flex-col gap-8 bg-surface-main"
      contentClassName="relative grid flex-1 grid-cols-1 gap-12 px-0! pb-16 md:grid-cols-2 md:gap-8 md:py-0"
    >
      <div className="z-1 mx-0 flex flex-col items-center justify-center text-center md:mx-auto md:items-start md:p-8 md:text-left">
        <h2 className="font-cormorant text-3xl font-semibold uppercase md:text-4xl">
          {title}
          <br />
          <span className="text-4xl font-bold text-brand-primary-dark md:text-5xl">
            {subTitle}
          </span>
        </h2>
        <p className="text-text-muted mt-3 max-w-[40ch] text-sm">
          {description}
        </p>
        <div className="flex flex-col items-center gap-4">
          <PartnerRequestDialog />

          <span className="font-cormorant flex flex-row items-center justify-center gap-2">
            <AstroidIcon color="var(--color-brand-primary)" size={16} /> A new chapter starts here
          </span>
        </div>
      </div>
    </Section>
  );
}
