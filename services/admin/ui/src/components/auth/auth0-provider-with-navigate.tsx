import { Auth0Provider, User } from "@auth0/auth0-react";
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export const Auth0ProviderWithNavigate: React.FC<Auth0ProviderWithNavigateProps> = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState: { returnTo?: string }, user?: User) => {
    console.log("onRedirectCallback", appState, user);
    navigate(appState?.returnTo || window.location.pathname);
  };

  console.log(import.meta.env.VITE_USER_POOL_LOGIN_ID)
  return (
    <Auth0Provider
      domain="https://inside-out-commerce-prod.auth.ap-southeast-2.amazoncognito.com"
      clientId="378ri5r4qmg0d44c9d5k58rb7h"
      issuer={`https://${import.meta.env.VITE_USER_POOL_LOGIN_ID}`}
      useRefreshTokens={true}
      cacheLocation={"localstorage"}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onRedirectCallback={(a,u) => onRedirectCallback(a!, u)}
      authorizationParams={{
        audience: "378ri5r4qmg0d44c9d5k58rb7h",
        redirect_uri: window.location.origin,
        scope:
          "openid profile email https://catalog.inside-out-commerce.com/api.execute",
      }}
    >
      {children}
    </Auth0Provider>
  );
};