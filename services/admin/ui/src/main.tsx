import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain="https://inside-out-commerce-prod.auth.ap-southeast-2.amazoncognito.com"
      clientId="378ri5r4qmg0d44c9d5k58rb7h"
      issuer="https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_V1m1AEYXE"
      useRefreshTokens={true}
      cacheLocation={"localstorage"}
      authorizationParams={{
        audience: "378ri5r4qmg0d44c9d5k58rb7h",
        redirect_uri: window.location.origin,
        scope:
          "openid profile email https://catalog.inside-out-commerce.com/api.execute",
      }}
    >
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </Auth0Provider>
  </React.StrictMode>
);

