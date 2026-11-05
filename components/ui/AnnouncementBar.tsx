import { Section } from "./Section";

export function AnnouncementBar() {
  return (
    <Section
      as="div"
      className="bg-announcement-bg text-announcement-text py-2 text-center text-xs font-medium tracking-wide lg:text-left"
    >
      Early Users Get <span className="font-bold text-brand-primary">50% Off</span>{" "}
      - Hurry up, Limited Time Offer!
    </Section>
  );
}
