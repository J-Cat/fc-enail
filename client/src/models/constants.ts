export const Constants = {
  TOKEN_STATE_KEY: 'FC_ENAIL_TOKEN_STATE_KEY',
  LANGUAGE_STATE_KEY: 'FC_ENAIL_LANGUAGE_STATE_KEY',
  CLIENT_BASE_PATH: process.env.REACT_APP_CLIENT_BASE_PATH || '/',
  API_URL: process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_URL || '/api'
    : '/api',
  SOCKET_URL: process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_SOCKET_URL || '/'
    : '/',
};