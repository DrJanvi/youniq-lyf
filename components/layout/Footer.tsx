import { Logo } from "@/components/ui/Logo";
import { listTaxonomy } from "@/services/taxonomy";
import Image from "next/image";
import Link from "next/link";
import { Section } from "../ui/Section";

const ABOUT_LINKS = [
  ["About Us", "/about-us"],
  ["Our Story", "/about-us"],
  ["Testimonials", "/testimonials"],
  ["Contact Us", "/contact"],
  ["Blogs", "/blogs"],
  ["Career", "/careers"],
] as const;

const HELP_LINKS = [
  ["Terms & Conditions", "/terms-and-conditions"],
  ["Privacy Policy", "/privacy-policy"],
  ["Return & Exchange Policy", "/return-exchange-policy"],
  [
    "Shipping, Payment & Cancellation Policy",
    "/shipping-payment-cancellation-policy",
  ],
  ["Refunds Policy", "/refunds-policy"],
  ["FAQs", "/faqs"],
] as const;

function PaymentMarks() {
  const marks = [
    {
      title: "VISA",
      icon: "/assets/visa.svg",
    },
    {
      title: "Mastercard",
      icon: "/assets/mastercard.svg",
    },
    {
      title: "American Express",
      icon: "/assets/amex.svg",
    },
    {
      title: "Apple Pay",
      icon: "/assets/applepay.svg",
    },
  ];

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="Payment methods"
    >
      {marks.map(({ icon, title }) => (
        <Image
          key={title}
          src={icon}
          width={50}
          height={0}
          alt={title}
          className="object-cover"
        />
      ))}
    </div>
  );
}

function SocialLinks() {
  const socialIcons = [
    {
      icon: "/assets/facebook.svg",
      link: "https://www.facebook.com",
    },
    {
      icon: "/assets/instagram.svg",
      link: "https://www.instagram.com",
    },
    {
      icon: "/assets/x.svg",
      link: "https://www.x.com",
    },
    {
      icon: "/assets/youtube.svg",
      link: "https://www.youtube.com",
    },
  ];

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="Social media"
    >
      {socialIcons.map(({ icon, link }) => (
        <Link
          key={link}
          href={link}
          aria-label={link}
          target="_blank"
          rel="noreferrer"
          className="flex size-12 items-center justify-center rounded-full bg-[#f8f3f1] transition-colors hover:bg-[#efe5e1]"
        >
          <Image src={icon} width={24} height={24} alt={link} />
        </Link>
      ))}
    </div>
  );
}

export async function Footer() {
  const categories = await listTaxonomy("category");

  return (
    <div className="mt-auto">
      <Section as="footer" className="mt-20 bg-[#FFFCFC]" contentClassName="">
        <div className="border-b border-[#f0eeee] py-16">
          <div className="grid w-full max-w-[1760px] grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
            {/* <div className="mx-auto grid w-full max-w-[1760px] grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(8rem,0.9fr)_minmax(8rem,0.9fr)_minmax(0,1.8fr] lg:gap-x-8"> */}
            <div className="col-span-2">
              <Link
                href="/"
                aria-label="Youniqlyf home"
                className="inline-block"
              >
                <Logo className="h-32.5 w-auto lg:h-40" height={160} />
              </Link>
              <p className="mt-6 max-w-[33ch] text-sm leading-[1.9] text-[#777]">
                Buabed Youniqlyf Perfumes, established in 1995, is a pioneer in
                fragrance and personal care manufacturing. With decades of
                expertise, we create premium perfumes and cosmetics inspired by
                Arabian and European blends, delivering quality, innovation and
                excellence.
              </p>
            </div>

            <nav aria-label="Collections">
              <h2 className="font-cormorant text-xl leading-tight font-medium uppercase">
                Collections
              </h2>
              <ul className="mt-5 space-y-2.5 text-[15px] text-[#777] sm:text-base">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="hover:text-brand-espresso text-sm transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="About Youniqlyf">
              <h2 className="font-cormorant text-xl leading-tight font-medium uppercase">
                About
              </h2>
              <ul className="mt-5 space-y-2.5 text-[15px] text-[#777] sm:text-base">
                {ABOUT_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="hover:text-brand-espresso text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Help and policies">
              <h2 className="font-cormorant text-xl leading-tight font-medium uppercase">
                Help
              </h2>
              <ul className="mt-5 space-y-2.5 text-[15px] text-[#777] sm:text-base">
                {HELP_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="hover:text-brand-espresso text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-14 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <SocialLinks />
            <PaymentMarks />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 py-4 text-center text-[#a0a0a0]">
          <span>
            © Copyright {new Date().getFullYear()}. All Rights Reserved.
          </span>
          <span aria-hidden="true" className="hidden text-[#333] sm:inline">
            |
          </span>
          <span className="text-[#333]">
            Powered by <span className="text-[#f5a500]">Doors</span>{" "}
            <strong>Studio</strong>
          </span>
        </div>
      </Section>
    </div>
  );
}
