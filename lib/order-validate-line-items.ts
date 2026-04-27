import { getProductById } from "@/lib/db/products";
import type { CreateOrderInput } from "@/lib/validators";

export async function assertLineItemsValid(
  data: CreateOrderInput
): Promise<void> {
  for (const line of data.lineItems) {
    const p = await getProductById(line.productId);
    if (!p || !p.active) {
      throw new Error(`Product not available: ${line.name}`);
    }
    if (line.quantity > p.stock) {
      throw new Error(
        `Not enough stock for ${p.name} (available: ${p.stock})`
      );
    }
    if (p.price !== line.price) {
      throw new Error(`Price changed for ${p.name}. Please refresh and try again.`);
    }
  }
}
