/**
 * Returns the base API URL based on the environment
 * Uses development URL when in development mode
 * Uses production URL when in production mode
 */
export const getApiUrl = (): string => {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

  let raw =
    appEnv === 'production'
      ? process.env.NEXT_PUBLIC_API_URL || 'https://api.gdghit.site/api/v1'
      : process.env.NEXT_PUBLIC_DEV_API_URL || 'http://localhost:8080/api/v1';

  raw = raw.replace(/\/+$/, '');
  // Common mistake: http://localhost:8080 — routes live under /api/v1
  if (!raw.endsWith('/api/v1')) {
    raw = `${raw}/api/v1`;
  }
  return raw;
};

/**
 * Creates a full API endpoint by appending the path to the base URL
 * @param path - The API endpoint path (without leading slash)
 */
export const getApiEndpoint = (path: string): string => {
  const baseUrl = getApiUrl();
  // Ensure there's no double slash between base URL and path
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${normalizedPath}`;
};
