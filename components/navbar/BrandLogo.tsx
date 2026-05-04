import Link from "next/link";
import Image from "next/image";

export default function BrandLogo({
  onClick,
  priority = false,
}: {
  onClick?: () => void;
  priority?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center" onClick={onClick}>
      <Image
        src="/logo.png"
        alt="Dayli Energy"
        width={750}
        height={192}
        className="h-[8.25rem] w-auto object-contain sm:h-[9rem]"
        priority={priority}
      />
    </Link>
  );
}
