import Image from "next/image";

type LogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

const RATIO = 212 / 304;

export function Logo({ className, height = 40, priority }: LogoProps) {
  return (
    <Image
      src="/logo-with-name.svg"
      alt="Banafa"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
