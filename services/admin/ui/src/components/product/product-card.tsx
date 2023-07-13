import {
  AspectRatio,
  Box,
  Image,
  Skeleton,
  Stack,
  StackProps,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// import { Rating } from "./Rating";
// import { FavouriteButton } from "./favourite-button";
import { PriceTag } from "./price-tag";
import { z } from "zod";

export const ProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  rrp: z.number(),
  categoryId: z.string(),
  category: z.string(),
  subcategory: z.string(),
});

export type ProductDetails = z.infer<typeof ProductSchema>;

type Props = {
  product: ProductDetails;
  rootProps?: StackProps;
};

export const ProductCard = (props: Props) => {
  const { product, rootProps } = props;
  const { name, rrp, description, shortDescription } = product;
  const imageUrl = `/images/products/${product.categoryId}/${product.subcategory
    .replaceAll(" ", "")
    .toLowerCase()}_300.png`;
  const updatedHandler =
    (property: keyof ProductDetails) =>
    (event: React.FocusEvent<HTMLParagraphElement>) => {
      product[property] = event.currentTarget.innerText as never;
    };

  return (
    <Stack rounded={"10"} boxShadow="md" backgroundColor={"whiteAlpha.800"} padding={5} spacing={{ base: "4", md: "5" }} {...rootProps}>
      <Box position="relative">
        <AspectRatio ratio={4 / 3}>
          <Image
            src={imageUrl}
            alt={name}
            draggable="false"
            fallback={<Skeleton />}
            borderRadius={{ base: "md", md: "xl" }}
          />
        </AspectRatio>
        {/* <FavouriteButton
          position="absolute"
          top="4"
          right="4"
          aria-label={`Add ${name} to your favourites`}
        /> */}
      </Box>
      <Stack>
        <Stack spacing="1">
          <Text
            contentEditable={true}
            onBlur={updatedHandler("name")}
            fontSize="lg"
            fontWeight="semibold"
            color={useColorModeValue("gray.700", "gray.400")}
          >
            {name}
          </Text>
          <Text
            contentEditable={true}
            onBlur={updatedHandler("shortDescription")}
            fontWeight="medium"
            color={useColorModeValue("gray.600", "gray.200")}
          >
            {shortDescription}
          </Text>
          <hr />
          <Text
            marginTop={1}
            contentEditable={true}
            onBlur={updatedHandler("description")}
            fontWeight="medium"
            color={useColorModeValue("gray.700", "gray.400")}
          >
            {description}
          </Text>
          <PriceTag price={rrp} currency="USD" />
        </Stack>
        {/* <HStack>
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
            12 Reviews
          </Text>
        </HStack> */}
      </Stack>
      {/* <Stack align="center">
        <Button colorScheme="blue" width="full">
          Add to cart
        </Button>
        <Link
          textDecoration="underline"
          fontWeight="medium"
          color={useColorModeValue("gray.600", "gray.400")}
        >
          Quick shop
        </Link>
      </Stack> */}
    </Stack>
  );
};
