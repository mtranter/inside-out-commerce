import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CatalogUploadPage } from "./pages";
import { CatalogPage } from "./pages/catalog";
import { Auth0ProviderWithNavigate } from "./components/index.ts";

const colors = {
  brand: {
    50: "#ecefff",
    100: "#cbceeb",
    200: "#a9aed6",
    300: "#888ec5",
    400: "#666db3",
    500: "#4d5499",
    600: "#3c4178",
    700: "#2a2f57",
    800: "#181c37",
    900: "#080819",
  },
};

const theme = extendTheme({ colors });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Auth0ProviderWithNavigate><App /></Auth0ProviderWithNavigate>,
    children: [
      {
        element: <CatalogPage />,
        path: "catalog",
      },
      {
        path: "catalog/upload",
        element: <CatalogUploadPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
  </React.StrictMode>
);
