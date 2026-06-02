export function getBaseUrl(): URL {
  return new URL('./', document.baseURI || window.location.href);
}

export function resolveAppUrl(path: string): string {
  return new URL(path, getBaseUrl()).href;
}
