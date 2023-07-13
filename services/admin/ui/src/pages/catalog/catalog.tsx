import { Heading } from "@chakra-ui/react";
import "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

export const CatalogPage = () => {
  return (
    <>
      <Heading>Catalog</Heading>
      <Link to="upload">Upload</Link>
      <Outlet />
    </>
  );
};
