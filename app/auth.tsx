import { router, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../stores";

const AuthGoogleRedirect = () => {
  const { accessToken, refreshToken } = useGlobalSearchParams<{
    accessToken: string;
    refreshToken: string;
  }>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  useEffect(() => {
    if (accessToken) setAccessToken(accessToken as string);

    if (refreshToken) setRefreshToken(refreshToken as string);

    router.replace("/home");
  }, [accessToken, refreshToken]);

  return null;
};

export default AuthGoogleRedirect;
