import { getProductById } from "@/lib/db/products";
import { getPackageById } from "@/lib/db/packages";
import type { CreateOrderInput } from "@/lib/validators";

export async function assertLineItemsValid(
  data: CreateOrderInput
): Promise<void> {
  for (const line of data.lineItems) {
    const p = await getProductById(line.productId);
    if (p?.active) {
      if (line.quantity > p.stock) {
        throw new Error(
          `Not enough stock for ${p.name}. Reduce the quantity in your cart or remove the item and try again.`
        );
      }
      if (p.price !== line.price) {
        throw new Error(
          `Price changed for ${p.name}. Please refresh and try again.`
        );
      }
      continue;
    }
    const pkg = await getPackageById(line.productId);
    if (!pkg || !pkg.active) {
      throw new Error(`Product not available: ${line.name}`);
    }
    if (line.quantity > pkg.stock) {
      throw new Error(
        `Not enough stock for ${pkg.name}. Reduce the quantity in your cart or remove the item and try again.`
      );
    }
    if (pkg.price !== line.price) {
      throw new Error(
        `Price changed for ${pkg.name}. Please refresh and try again.`
      );
    }
  }
}
