export function getBaseUrl(): URL {
  return new URL(import.meta.env.BASE_URL || './', window.location.href);
}

export function resolveAppUrl(path: string): string {
  return new URL(path, getBaseUrl()).href;
}
