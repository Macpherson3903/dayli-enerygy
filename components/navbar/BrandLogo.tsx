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
        width={375}
        height={96}
        className="h-[4.125rem] w-auto object-contain sm:h-[4.5rem]"
        priority={priority}
      />
    </Link>
  );
}
