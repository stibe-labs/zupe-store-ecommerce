import { redirect } from "next/navigation";

export default function BestSellersPage() {
  redirect("/products?filter=best");
}
