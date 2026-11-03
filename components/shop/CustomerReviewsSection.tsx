import { listLatestReviews } from "@/services/review";
import { Section } from "../ui/Section";
import { CustomerReviewsSlider } from "./CustomerReviewsSlider";
import { SectionHeading } from "./SectionHeading";

export async function CustomerReviewsSection() {
  const reviews = await listLatestReviews();

  return (
    <Section contentClassName="py-16">
      <SectionHeading>Client Reviews</SectionHeading>
      <CustomerReviewsSlider reviews={reviews} />
    </Section>
  );
}
