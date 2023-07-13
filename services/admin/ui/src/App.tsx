/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FaBell } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { MdHome, MdKeyboardArrowRight } from "react-icons/md";
import { AiFillGift } from "react-icons/ai";
import { BsGearFill } from "react-icons/bs";
import { GrCatalog } from "react-icons/gr";
import {
  Avatar,
  Box,
  BoxProps,
  Collapse,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  InputGroup,
  Link as ChakraLink,
  Stack,
  Text,
  chakra,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, Outlet } from "react-router-dom";
import { ElementType, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface NavItemProps extends BoxProps {
  icon?: ElementType;
  children?: ReactNode;
}

const App = () => {
  const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0();
  const sidebar = useDisclosure();
  const catalog = useDisclosure();
  const color = useColorModeValue("gray.600", "gray.300");
  const NavItem = (props: NavItemProps) => {
    const { icon, children, ...rest } = props;
    return (
      <Flex
        align="center"
        px="4"
        pl="4"
        py="3"
        cursor="pointer"
        color="inherit"
        _dark={{
          color: "gray.400",
        }}
        _hover={{
          bg: "gray.100",
          _dark: {
            bg: "gray.900",
          },
          color: "gray.900",
        }}
        role="group"
        fontWeight="semibold"
        transition=".15s ease"
        {...rest}
      >
        {icon && (
          <Icon
            mx="2"
            boxSize="4"
            _groupHover={{
              color: color,
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    );
  };

  const SidebarContent = (props: BoxProps) => (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg="white"
      _dark={{
        bg: "gray.800",
      }}
      color="inherit"
      borderRightWidth="1px"
      w="60"
      {...props}
    >
      <Flex px="4" py="5" align="center">
        {/* <Logo /> */}
        <Text
          fontSize="2xl"
          ml="2"
          color="brand.500"
          _dark={{
            color: "white",
          }}
          fontWeight="semibold"
        >
          Admin
        </Text>
      </Flex>
      <Flex
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
      >
        <NavItem icon={MdHome}>
          <Link to="/">Home</Link>
        </NavItem>
        <NavItem icon={GrCatalog} onClick={catalog.onToggle}>
          Catalog
          <Icon
            as={MdKeyboardArrowRight}
            ml="auto"
            transform={catalog.isOpen ? "rotate(90deg)" : undefined}
          />
        </NavItem>
        <Collapse in={catalog.isOpen}>
          <Link to="catalog">
            <NavItem pl="12" py="2">
              Browse
            </NavItem>
          </Link>
          <Link to="catalog/upload">
            <NavItem pl="12" py="2">
              Upload
            </NavItem>
          </Link>
        </Collapse>
        <NavItem icon={AiFillGift}>Changelog</NavItem>
        <NavItem icon={BsGearFill}>Settings</NavItem>
      </Flex>
    </Box>
  );
  const Login = () => (
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
              <ChakraLink
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
              </ChakraLink>
            </Box>
          </Stack>
        </Box>
      </Flex>
    </Flex>
  );

  const App = () => (
    <Box
      as="section"
      bg="gray.50"
      _dark={{
        bg: "gray.700",
      }}
      minH="100vh"
    >
      <SidebarContent
        display={{
          base: "none",
          md: "unset",
        }}
      />
      <Drawer
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box
        ml={{
          base: 0,
          md: 60,
        }}
        transition=".3s ease"
      >
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px="4"
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          borderBottomWidth="1px"
          color="inherit"
          h="14"
        >
          <IconButton
            aria-label="Menu"
            display={{
              base: "inline-flex",
              md: "none",
            }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size="sm"
          />
          <InputGroup
            w="96"
            display={{
              base: "none",
              md: "flex",
            }}
          >
            {/* <InputLeftElement color="gray.500">
        <FiSearch />
      </InputLeftElement> */}
            {/* <Input placeholder="Search for product..." /> */}
          </InputGroup>

          <Flex align="center">
            <Icon color="gray.500" as={FaBell} cursor="pointer" />
            <Avatar
              ml="4"
              size="sm"
              name={user?.name}
              src={user?.picture}
              cursor="pointer"
            />
          </Flex>
        </Flex>

        <Box as="main" p="4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );

  const Loading = () => <div>Loading...</div>

  return isLoading ? <Loading /> : isAuthenticated ? <App /> : <Login />;
};

export default App;
