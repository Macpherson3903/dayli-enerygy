import Image, { type ImageProps } from "next/image";
import {
  isLocalPublicImage,
  normalizeCatalogImageSrc,
} from "@/lib/images";

type CatalogImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | undefined | null;
  alt: string;
};

/** Product/package imagery — local public files and Cloudinary URLs. */
export function CatalogImage({ src, alt, ...props }: CatalogImageProps) {
  const normalized = normalizeCatalogImageSrc(src);
  return (
    <Image
      src={normalized}
      alt={alt}
      unoptimized={isLocalPublicImage(normalized)}
      {...props}
    />
  );
}
