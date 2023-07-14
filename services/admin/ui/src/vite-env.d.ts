/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_AWS_REGION: string;
  readonly VITE_IDENTITY_POOL_ID: string;
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_LOGIN_ID: string;
  readonly VITE_ADMIN_IAM_ROLE: string;
  readonly VITE_CATALOG_API_ROOT: string;
  readonly VITE_CATALOG_SCOPE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
