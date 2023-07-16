import { Auth0Provider } from "@auth0/auth0-react";
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export const Auth0ProviderWithNavigate: React.FC<Auth0ProviderWithNavigateProps> = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState: { returnTo?: string }) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH_DOMAIN}
      clientId={import.meta.env.VITE_USER_POOL_CLIENT_ID}
      issuer={`https://${import.meta.env.VITE_USER_POOL_LOGIN_ID}`}
      useRefreshTokens={true}
      cacheLocation={"localstorage"}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onRedirectCallback={(a) => onRedirectCallback(a!)}
      authorizationParams={{
        audience: import.meta.env.VITE_USER_POOL_CLIENT_ID,
        redirect_uri: window.location.origin,
        scope:
          `openid profile email ${import.meta.env.VITE_CATALOG_SCOPE_ID}`,
      }}
    >
      {children}
    </Auth0Provider>
  );
};