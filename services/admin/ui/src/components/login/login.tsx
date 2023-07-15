import { useAuth0 } from "@auth0/auth0-react";
import { Box, Flex, Link, Stack, chakra } from "@chakra-ui/react";

export const Login = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Flex
      bg="#edf3f8"
      _dark={{
        bg: "#3e3e3e",
      }}
      p={50}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        justify="center"
        bg="white"
        _dark={{
          bg: "gray.800",
        }}
        w="full"
      >
        <Box
          w={{
            base: "full",
            md: "75%",
            lg: "50%",
          }}
          px={4}
          py={20}
          textAlign={{
            base: "left",
            md: "center",
          }}
        >
          <chakra.span
            fontSize={{
              base: "3xl",
              sm: "4xl",
            }}
            fontWeight="extrabold"
            letterSpacing="tight"
            lineHeight="shorter"
            color="gray.900"
            _dark={{
              color: "gray.100",
            }}
            mb={6}
          >
            <chakra.span display="block">Admin Portal</chakra.span>
            <chakra.span
              display="block"
              color="brand.600"
              _dark={{
                color: "gray.500",
              }}
            >
              But you gotta login first
            </chakra.span>
          </chakra.span>
          <Stack
            justifyContent={{
              base: "left",
              md: "center",
            }}
            direction={{
              base: "column",
              sm: "row",
            }}
            spacing={2}
            mt={2}
          >
            <Box display="inline-flex" rounded="md" shadow="md">
              <Link
                onClick={() => loginWithRedirect()}
                w="full"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                px={5}
                py={3}
                border="solid transparent"
                fontWeight="bold"
                rounded="md"
                _light={{
                  color: "white",
                }}
                bg="brand.600"
                _dark={{
                  bg: "brand.500",
                }}
                _hover={{
                  bg: "brand.700",
                  _dark: {
                    bg: "brand.600",
                  },
                }}
              >
                Login
              </Link>
            </Box>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );
};
