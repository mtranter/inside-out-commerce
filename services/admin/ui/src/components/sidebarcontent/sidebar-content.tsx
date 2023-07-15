import {
  Box,
  BoxProps,
  Collapse,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AiFillGift } from "react-icons/ai";
import { BsGearFill } from "react-icons/bs";
import { GrCatalog } from "react-icons/gr";
import { MdHome, MdKeyboardArrowRight } from "react-icons/md";
import { NavItem } from "./nav-item";
import { Link } from "react-router-dom";

export const SidebarContent = (props: BoxProps) => {
  const catalog = useDisclosure();
  return (
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
        {/* <NavItem icon={AiFillGift}>Changelog</NavItem> */}
        {/* <NavItem icon={BsGearFill}>Settings</NavItem> */}
      </Flex>
    </Box>
  );
};
