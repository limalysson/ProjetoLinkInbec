const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return `http://${hostname}:3001`;
};

export const API_BASE_URL = getApiBaseUrl();

export const getResourceUrl = (path) => {
  if (path && path.startsWith('/uploads')) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
};