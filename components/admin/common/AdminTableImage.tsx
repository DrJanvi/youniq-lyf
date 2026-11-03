import Image from "next/image";

export function AdminTableImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={56}
      height={56}
      unoptimized
      className="size-14 shrink-0 rounded-md border border-border bg-white p-1.5 object-contain"
    />
  );
}
