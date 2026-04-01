/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_BETTER_AUTH_URL: string | undefined;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
