import Image, { type ImageProps } from "next/image";
import { clsx } from "clsx";
import {
  isLocalPublicImage,
  isRemoteCatalogImage,
  normalizeCatalogImageSrc,
} from "@/lib/images";

type CatalogImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | undefined | null;
  alt: string;
};

/**
 * Product/package imagery.
 * Remote URLs (Cloudinary) use a native `<img>` so Vercel's image optimizer
 * cannot break production delivery; local `/public` assets use `next/image`.
 */
export function CatalogImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
  ...props
}: CatalogImageProps) {
  const normalized = normalizeCatalogImageSrc(src);

  if (isRemoteCatalogImage(normalized)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalized}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={clsx(
            "absolute inset-0 h-full w-full object-cover",
            className
          )}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalized}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        width={typeof props.width === "number" ? props.width : undefined}
        height={typeof props.height === "number" ? props.height : undefined}
      />
    );
  }

  return (
    <Image
      src={normalized}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized={isLocalPublicImage(normalized)}
      className={className}
      {...props}
    />
  );
}
