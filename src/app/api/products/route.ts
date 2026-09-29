import { getProducts } from "@/lib/services/catalog";

export const revalidate = 300;

export async function GET() {
  return Response.json(await getProducts());
}
