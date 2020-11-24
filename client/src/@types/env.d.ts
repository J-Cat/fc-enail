/* eslint-disable @typescript-eslint/no-empty-interface */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_CLIENT_BASE_PATH: string;
      REACT_APP_API_URL?: string;
      REACT_APP_SOCKET_URL?: string;
    }
  }
}

export {};