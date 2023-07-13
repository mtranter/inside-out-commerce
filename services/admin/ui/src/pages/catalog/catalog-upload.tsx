import "react";
import { ChangeEvent, useRef, useState } from "react";
import {
  ProductCard,
  ProductDetails,
  ProductGrid,
  ProductSchema,
} from "../../components";
import { z } from "zod";
import {
  Box,
  FormControl,
  FormLabel,
  Flex,
  Icon,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Button,
} from "@chakra-ui/react";
import { useIamFetch } from "../../hooks";

const ProductArraySchema = z.array(ProductSchema);
export const CatalogUploadPage = () => {
  const { fetch } = useIamFetch();
  const [isHovered, setIsHovered] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const uploadProducts = async () => {
    const res = await fetch(`${import.meta.env.VITE_CATALOG_API_ROOT}/catalog`, {
      method: "POST",
      body: JSON.stringify(products),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      setProducts([]);
    } else {
      setError("Error uploading products");
    }
  };
  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const file = e.target!.result;
      const json = JSON.parse(file!.toString());
      const parsed = ProductArraySchema.safeParse(json);
      if (parsed.success) {
        setProducts(parsed.data);
      } else {
        setError("Invalid Products JSON file, please provide a valid one.");
      }
    };
    reader.readAsText(f);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target!.files![0];
    handleFile(file);
  };
  return (
    <div>
      {error && (
        <Alert
          // justifyContent={"space-between"}
          // display={"inline-flex"}
          status="error"
          m="auto"
          variant="left-accent"
          rounded={5}
          mb={"25"}
        >
          <Box>
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Box>
          <CloseButton
            alignSelf="flex-start"
            justifySelf={"flex-end"}
            position="relative"
            right={-1}
            top={-1}
            onClick={() => setError(null)}
          />
        </Alert>
      )}
      {products.length > 0 ? (
        <Flex maxW={"200px"} m="auto" justifyContent="space-between">
          <Button colorScheme="brand" onClick={() => uploadProducts()}>Save</Button>
          <Button
            colorScheme="brand"
            variant="outline"
            onClick={() => setProducts([])}
          >
            Cancel
          </Button>
        </Flex>
      ) : (
        <FormControl>
          <FormLabel
            fontSize="lg"
            fontWeight="semibold"
            color="gray.800"
            _dark={{
              color: "gray.50",
            }}
          >
            Upload Products
          </FormLabel>
          <Flex
            mt={1}
            justify="center"
            px={6}
            pt={5}
            pb={6}
            borderWidth={2}
            _dark={{
              color: "gray.500",
            }}
            borderStyle="dashed"
            borderColor={isHovered ? "gray.500" : "gray.300"}
            backgroundColor={isHovered ? "white" : "gray.50"}
            boxShadow={isHovered ? "dark-lg" : "none"}
            rounded="md"
            onClick={() => uploadRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsHovered(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsHovered(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsHovered(false);
              handleFile(e.dataTransfer.files[0]);
            }}
          >
            <Stack spacing={1} textAlign="center">
              <Icon
                mx="auto"
                boxSize={12}
                color="gray.400"
                _dark={{
                  color: "gray.500",
                }}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Icon>
              <Flex
                fontSize="sm"
                color="gray.600"
                _dark={{
                  color: "gray.400",
                }}
                alignItems="baseline"
              >
                <chakra.label
                  htmlFor="file-upload"
                  cursor="pointer"
                  rounded="md"
                  fontSize="md"
                  color="brand.600"
                  _dark={{
                    color: "brand.200",
                  }}
                  pos="relative"
                  _hover={{
                    color: "brand.400",
                    _dark: {
                      color: "brand.300",
                    },
                  }}
                >
                  <span>Upload a file or drag and drop</span>
                  <VisuallyHidden>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      ref={uploadRef}
                      onChange={handleChange}
                    />
                  </VisuallyHidden>
                </chakra.label>
              </Flex>
              <Text
                fontSize="xs"
                color="gray.500"
                _dark={{
                  color: "gray.50",
                }}
              >
                Only valid products json files are allowed
              </Text>
            </Stack>
          </Flex>
        </FormControl>
      )}

      {products.length > 0 ? (
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
          </ProductGrid>
        </Box>
      ) : null}
    </div>
  );
};
