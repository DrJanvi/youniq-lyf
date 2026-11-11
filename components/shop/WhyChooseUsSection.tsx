import Image from "next/image";
import { Section } from "../ui/Section";

export function WhyChooseUsSection() {
  const title = "Why Choose Youniqlyf?";

  const features = [
    {
      title: "Premium Quality",
      description: "Carefully selected bags and accessories designed to offer style, durability and lasting quality.",
      image: "/assets/premiumQuality.svg",
    },
    {
      title: "Trendy Collections",
      description: "Discover the latest styles and timeless designs that complement every outfit and occasion.",
      image: "/assets/trendyCollections.svg",
    },
    {
      title: "Style Meets Functionality",
      description: "From everyday essentials to statement pieces, find the perfect blend of fashion and convenience.",
      image: "/assets/styleMeetsFunctionality.svg",
    },
    {
      title: "Customer First",
      description: "Enjoy a smooth shopping experience with dedicated support and care at every step.",
      image: "/assets/customerFirst.svg",
    },
  ];

  return (
    <Section
      className="relative my-22 gap-8 bg-surface-card"
      contentClassName="flex flex-col items-center justify-center gap-6 md:gap-14 lg:flex-row py-10"
    >
      <div className="absolute top-0 h-22 w-full -translate-y-full bg-[url('/images/wave.webp')]" />
      <div className="absolute bottom-0 h-22 w-full translate-y-full transform-[scaleY(-1)] bg-[url('/images/wave.webp')]" />

      <Image
        src="/images/why_choose_us_1.png"
        alt="Why Choose Us"
        width={292}
        height={369}
        aria-hidden="true"
      />
      <div className="flex flex-col items-center justify-center">
        <h2 className="font-cormorant mb-16 text-center text-4xl font-medium uppercase">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-12 gap-y-8 lg:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="mb-4 flex gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-card">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={20}
                  height={15}
                  aria-hidden="true"
                  className="h-8 w-8"
                />
              </div>
              <div>
                <h3 className="font-cormorant text-2xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Image
        src="/images/why_choose_us_4.png"
        alt="Why Choose Us 4"
        width={267}
        height={311}
        aria-hidden="true"
      />
    </Section>
  );
}
