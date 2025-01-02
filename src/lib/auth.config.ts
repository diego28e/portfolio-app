import { userPoolId } from "../lib/auth";
import { AuthProviderProps } from "react-oidc-context";

export const cognitoAuthConfig: AuthProviderProps = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${userPoolId}`,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  scope: "email openid phone",

  // 1) Turn off silent renew if you don't need it
  automaticSilentRenew: false,

  // so the OIDC client knows where to land after sign-out
  post_logout_redirect_uri: import.meta.env.VITE_LOGOUT_URI,
};
