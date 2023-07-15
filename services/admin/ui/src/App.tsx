/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FaBell } from "react-icons/fa";
import { FiMenu, FiSearch } from "react-icons/fi";
import {
  Avatar,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Login, SidebarContent } from "./components";

const App = () => {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const sidebar = useDisclosure();

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
            </InputLeftElement>
            <Input placeholder="Search for product..." /> */}
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

  const Loading = () => <div>Loading...</div>;

  return isLoading ? <Loading /> : isAuthenticated ? <App /> : <Login />;
};

export default App;
