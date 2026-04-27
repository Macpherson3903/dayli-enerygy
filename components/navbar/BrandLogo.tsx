import Link from "next/link";
import Image from "next/image";

export default function BrandLogo({
  onClick,
  showText = true,
}: {
  onClick?: () => void;
  showText?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2" onClick={onClick}>
      <Image
        src="/logo.png"
        alt="Dayli Energy"
        width={80}
        height={26}
        className="h-7 w-auto object-contain"
        priority
      />
      {showText && (
        <span className="text-base font-bold text-brand-900">Dayli Energy</span>
      )}
    </Link>
  );
}
