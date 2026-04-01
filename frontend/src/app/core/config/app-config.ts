export interface AppConfig {
  apiBaseUrl: string;
}

type GlobalWithAppConfig = typeof globalThis & {
  __APP_CONFIG__?: Partial<AppConfig>;
};

const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: '/api',
};

export function getAppConfig(globalObject: typeof globalThis = globalThis): AppConfig {
  const runtimeConfig = (globalObject as GlobalWithAppConfig).__APP_CONFIG__;

  return {
    apiBaseUrl: normalizeApiBaseUrl(runtimeConfig?.apiBaseUrl ?? DEFAULT_APP_CONFIG.apiBaseUrl),
  };
}

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  const trimmedApiBaseUrl = apiBaseUrl.trim();

  if (!trimmedApiBaseUrl || trimmedApiBaseUrl === '/') {
    return DEFAULT_APP_CONFIG.apiBaseUrl;
  }

  return trimmedApiBaseUrl.replace(/\/+$/, '');
}

declare global {
  var __APP_CONFIG__: Partial<AppConfig> | undefined;
}
