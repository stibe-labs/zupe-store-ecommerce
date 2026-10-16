import { redirect } from "next/navigation";

export default function DealsPage() {
  redirect("/products?filter=deals");
}
