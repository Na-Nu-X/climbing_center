// Production build: the API is expected behind the same domain (reverse proxy `/api` → Django).
export const environment = {
  production: true,
  apiUrl: '/api',
};
