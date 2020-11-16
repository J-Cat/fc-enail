export interface INetworkConfig {
  mode?: 'ap'|'infrastructure';
  ssid?: string;
  passcode?: string;
}

export interface INetworkState {
  requesting: boolean;
  scanning: boolean;
  loading: boolean;
  loaded: boolean;
  error?: string;
  config?: INetworkConfig;
  ssids: string[];
}