import { BoxProps, Flex, Icon, useColorModeValue } from "@chakra-ui/react";
import { ElementType, ReactNode } from "react";

interface NavItemProps extends BoxProps {
  icon?: ElementType;
  children?: ReactNode;
}

export const NavItem = (props: NavItemProps) => {
  const color = useColorModeValue("gray.600", "gray.300");
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
