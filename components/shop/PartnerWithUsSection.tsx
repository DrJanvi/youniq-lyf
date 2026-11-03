import { AstroidIcon } from "lucide-react";
import Image from "next/image";
import { Section } from "../ui/Section";
import { PartnerRequestDialog } from "./PartnerRequestDialog";

export function PartnerWithUsSection() {
  const title = "Partner with Us";
  const subTitle = "Grow Together.";
  const description =
    "Whether you're a distributor looking to expand your portfolio or an influencer ready to collaborate with a growing brand, we'd love to build something meaningful together.";

  return (
    <Section
      className="relative flex min-h-137.5 flex-col gap-8 bg-[#FFFCF9]"
      contentClassName="pb-16 md:py-0 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 px-0! flex-1"
    >
      <Image
        src="/images/partner_with_us.webp"
        alt="Partner with Us"
        width={688}
        height={483}
        className="w-full md:hidden"
      />

      <Image
        src="/images/partner_with_us_desktop.webp"
        alt="Partner with Us"
        width={1441}
        height={550}
        unoptimized
        className="absolute top-0 left-0 hidden h-full min-h-0 w-full object-cover object-center md:block"
      />

      <div className="z-1 mx-0 flex flex-col items-center justify-center text-center md:mx-auto md:items-start md:p-8 md:text-left">
        <h2 className="font-cormorant text-3xl font-semibold uppercase md:text-4xl">
          {title}
          <br />
          <span className="text-4xl font-bold text-[#8E5947] md:text-5xl">
            {subTitle}
          </span>
        </h2>
        <p className="text-text-muted mt-3 max-w-[40ch] text-sm">
          {description}
        </p>
        <div className="flex flex-col items-center gap-4">
          <PartnerRequestDialog />

          <span className="font-cormorant flex flex-row items-center justify-center gap-2">
            <AstroidIcon color="#743238" size={16} /> A new chapter starts here
          </span>
        </div>
      </div>
    </Section>
  );
}
