declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';

      LOCALTUNNEL_SUBDOMAIN?: string;
      STARTUP_SOUND?: string;

      API_PORT?: string;
      API_BASE_ROUTE_PATH?: string;
      API_CLIENT_PATH?: string;
      API_JWT_PUBLIC_CERT?: string;
      API_JWT_PRIVATE_KEY?: string;
      API_JWT_EXPIRES_IN?: string;

      ENCODER_A?: string;
      ENCODER_B?: string;
      ENCODER_S?: string;
      ENCODER_MAX_VELOCITY?: string;
      ENCODER_MIN_VALUE?: string;
      ENCODER_MAX_VALUE?: string;
      ENCODER_FREQUENCY?: string;
      ENCODER_BUTTON_DEBOUNCE?: string;

      DISPALY_INTERVAL?: string;
      DISPLAY_SCREEN_OFF?: string;
      DISPLAY_SCREEN_SAVER?: string;

      E5CC_DEVICE?: string;
      E5CC_INTERVAL?: string;
      E5CC_AUTOSHUTOFF?: string;
      E5CC_COMMAND_TIMEOUT?: string;
      E5CC_BAUDRATE?: string;
      E5CC_DATABITS?: string;
      E5CC_STOPBITS?: string;
      E5CC_PARITY?: 'even'|'none'|'mark'|'odd'|'space';

      BUTTON_BUTTON_PIN?: string;
      BUTTON_LED_PIN?: string;
      BUTTON_LONG_CLICK?: string;
      BUTTON_REALLY_LONG_CLICK?: string;
      BUTTON_REALLY_REALLY_LONG_CLICK?: string;
      BUTTON_DEBOUNCE?: string;

      AUDIO_MUTE_PIN?: string;
    }
  }
}

export {};