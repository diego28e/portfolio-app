const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
export const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
export const userPoolId = import.meta.env.VITE_USER_POOL_ID;
export const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const logoutUri = import.meta.env.VITE_LOGOUT_URI;

export const login = () => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "email openid phone",
    redirect_uri: redirectUri,
  });
  window.location.href = `${cognitoDomain}/login?${params.toString()}`;
};

export const logout = (idToken?: string) => {
  localStorage.removeItem("id_token");
  localStorage.removeItem(
    `oidc.user:https://cognito-idp.us-east-1.amazonaws.com/${userPoolId}:${clientId}`
  );
  sessionStorage.removeItem(
    `oidc.user:https://cognito-idp.us-east-1.amazonaws.com/${userPoolId}:${clientId}`
  );
  sessionStorage.clear();

  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: logoutUri,
  });
  if (idToken) {
    params.set("id_token_hint", idToken);
  }
  window.location.href = `${cognitoDomain}/logout?${params.toString()}`;
};
