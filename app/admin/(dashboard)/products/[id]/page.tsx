import { ProductFormPage } from "@/components/admin/pages/ProductFormPage";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductFormPage id={(await params).id} />;
}
