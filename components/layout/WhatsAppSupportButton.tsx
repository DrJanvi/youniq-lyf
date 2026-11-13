import Image from "next/image";

export function WhatsAppSupportButton() {
  return (
    <a
      href="https://wa.me/919871777077"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E54] sm:right-6 sm:bottom-6"
    >
      <Image
        src="/assets/whatsapp.png"
        alt=""
        width={56}
        height={56}
        className="size-14 rounded-full object-contain"
      />
    </a>
  );
}
