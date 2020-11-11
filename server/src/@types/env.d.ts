declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';

      API_PORT?: number;
      API_BASE_ROUTE_PATH?: string;
      API_CLIENT_PATH?: string;
      API_JWT_PUBLIC_CERT?: string;
      API_JWT_PRIVATE_KEY?: string;
      API_JWT_EXPIRES_IN?: string;

      ENCODER_A?: number;
      ENCODER_B?: number;
      ENCODER_S?: number;
      ENCODER_MAX_VELOCITY?: number;
      ENCODER_MIN_VALUE?: number;
      ENCODER_MAX_VALUE?: number;
      ENCODER_FREQUENCY?: number;

      DISPALY_INTERVAL?: number;
      DISPLAY_SCREEN_OFF?: number;
      DISPLAY_SCREEN_SAVER?: number;

      E5CC_DEVICE?: string;
      E5CC_INTERVAL?: number;
      E5CC_AUTOSHUTOFF?: number;
      E5CC_BAUDRATE?: number;
      E5CC_DATABITS?: number;
      E5CC_STOPBITS?: number;
      E5CC_PARITY?: 'even'|'none'|'mark'|'odd'|'space';
    }
  }
}

export {}