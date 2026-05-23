import { redirect } from "next/navigation";

export default function PackageCategoriesRedirectPage() {
  redirect("/admin/inventory/categories");
}
