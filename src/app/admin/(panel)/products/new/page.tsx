import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New product" sub="Saved as a draft by default. Add photos and stock after creating it." />
      <ProductForm
        initial={{
          name: "",
          slug: "",
          tagline: "",
          description: "",
          price: "",
          compareAtPrice: "",
          category: "tees",
          gender: ["men"],
          collections: [],
          colourIds: ["onyx"],
          sizes: ["S", "M", "L", "XL"],
          fabric: "",
          gsm: 0,
          composition: "",
          fit: "",
          stretch: "4-way",
          features: "",
          care: "Machine wash cold, inside out\nDo not bleach",
          badges: ["new"],
          featuredRank: 100,
          lowStockThreshold: 5,
          status: "draft",
        }}
      />
    </>
  );
}
