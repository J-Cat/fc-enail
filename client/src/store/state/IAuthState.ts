export interface IAuthState {
  requesting: boolean;
  authenticated: boolean;
  authenticating: boolean;
  token?: string;
  error?: string;
}