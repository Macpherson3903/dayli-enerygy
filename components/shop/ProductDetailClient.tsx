"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useCart } from "@/context/CartContext";
import type { ProductPublic } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ProductAgentModal } from "@/components/shop/ProductAgentModal";

export default function ProductDetailClient({
  product,
  related,
}: {
  product: ProductPublic;
  related: ProductPublic[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { addItem } = useCart();
  const inStock = product.stock > 0;
  const [agentOpen, setAgentOpen] = useState(false);
  const agentReturnUrl = pathname && pathname !== "" ? pathname : "/order";
  const isPackage = product.itemKind === "package";

  return (
    <>
      {!isPackage ? (
        <ProductAgentModal
          open={agentOpen}
          onClose={() => setAgentOpen(false)}
          product={product}
        />
      ) : null}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            <p className="text-sm text-green-600 capitalize mb-2">
              {isPackage ? "Package" : product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-green-700 mt-4">
              ₦{product.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {inStock
                ? `${product.stock} in stock`
                : "Currently out of stock"}
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>
            {product.typicalAppliances && product.typicalAppliances.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold mb-3">Typical home loads</h2>
                <p className="text-xs text-gray-500 mb-2">
                  Illustrative examples — actual capacity depends on your usage
                  and installation.
                </p>
                <ul className="space-y-2">
                  {product.typicalAppliances.map((line, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-green-600" aria-hidden>
                        ✓
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.features?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold mb-3">Key features</h2>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-green-600" aria-hidden>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={!inStock}
                onClick={() => addItem(product, 1)}
                className="px-6 py-3"
              >
                {inStock ? "Add to cart" : "Out of stock"}
              </Button>
              {!isPackage ? (
                !authLoaded ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled
                    className="px-6 py-3"
                  >
                    Talk to an agent
                  </Button>
                ) : isSignedIn ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAgentOpen(true)}
                    className="px-6 py-3"
                  >
                    Talk to an agent
                  </Button>
                ) : (
                  <SignInButton mode="modal" forceRedirectUrl={agentReturnUrl}>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-6 py-3"
                    >
                      Talk to an agent
                    </Button>
                  </SignInButton>
                )
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/order")}
                className="px-6 py-3"
              >
                Back to products
              </Button>
            </div>
          </motion.div>
        </div>
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold mb-6">
              {isPackage ? "More packages & products" : "Related products"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    router.push(`/order/${encodeURIComponent(item.slug)}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(
                        `/order/${encodeURIComponent(item.slug)}`
                      );
                    }
                  }}
                  className="cursor-pointer border rounded-xl p-4 hover:shadow-md transition"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
