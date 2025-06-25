import { router, Stack, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { toast } from "sonner-native";
import Loading from "../components/loading";
import { useAuthStore } from "../stores";

const AuthGoogleRedirect = () => {
  const { accessToken, refreshToken, error } = useGlobalSearchParams<{
    accessToken: string;
    refreshToken: string;
    error?: string;
  }>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  useEffect(() => {
    if (error) {
      toast.error(error);
      router.replace("/");
      return;
    }

    if (accessToken) setAccessToken(accessToken as string);

    if (refreshToken) setRefreshToken(refreshToken as string);

    router.replace("/home");
  }, [accessToken, refreshToken]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <Loading visible />
    </>
  );
};

export default AuthGoogleRedirect;
