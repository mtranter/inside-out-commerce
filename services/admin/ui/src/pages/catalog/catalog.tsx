import { Box, Heading } from "@chakra-ui/react";
import "react";
import { useIamFetch } from "../../hooks";
import { useCallback, useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import {
  ProductCard,
  ProductDetails,
  ProductGrid,
} from "../../components";

export const CatalogPage = () => {
  const { fetch } = useIamFetch();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchProducts = useCallback(
    async () => {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_CATALOG_API_ROOT}/catalog${
          nextToken ? `?nextToken=${encodeURIComponent(nextToken)}` : ""
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res
        .json()
        .then((r) => {
          const newProducts = [...products, ...r.products];
          setNextToken(r.nextToken);
          setProducts(newProducts);
        })
        .catch((e) => {
          console.error(e);
          setError("Error fetching products");
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [products, nextToken]
  );
  useEffect(() => {
    fetchProducts();
  }, []);
  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: !!nextToken,
    onLoadMore: fetchProducts,
    // When there is an error, we stop infinite loading.
    // It can be reactivated by setting "error" state as undefined.
    disabled: !!error,
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: "0px 0px 0px 0px",
  });

  return (
    <>
      <Heading size="md" fontWeight="semibold">
        Catalog
      </Heading>
      <Box
        maxW="7xl"
        mx="auto"
        px={{ base: "4", md: "8", lg: "12" }}
        py={{ base: "6", md: "8", lg: "12" }}
      >
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
          {(loading || !!nextToken) && <div ref={sentryRef}>Loading...</div>}
        </ProductGrid>
      </Box>
      
    </>
  );
};
