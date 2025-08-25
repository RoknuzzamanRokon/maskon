import { getProduct } from "../../../lib/api";
import ProductChat from "../../../components/ProductChat";
import { notFound } from "next/navigation";

export default async function ProductChatPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <ProductChat
        productId={product.id}
        productName={product.name}
        productImage={product.image_urls?.[0]}
        productPrice={product.price}
        isFullScreen={true}
      />
    </div>
  );
}
