import { router, Stack, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { toast } from "sonner-native";
import { setUser as fetchUserFromAPI } from "../apis/auth.api";
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
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const initializeAuth = async () => {
      if (error) {
        toast.error(error);
        router.replace("/");
        return;
      }

      if (accessToken) setAccessToken(accessToken as string);
      if (refreshToken) setRefreshToken(refreshToken as string);

      // Fetch user information after setting tokens
      if (accessToken) {
        try {
          const userData = await fetchUserFromAPI();
          setUser(userData);
        } catch (error) {
          console.log("Failed to fetch user:", error);
          toast.error("Failed to load user information");
        }
      }

      router.replace("/home");
    };

    initializeAuth();
  }, [accessToken, refreshToken]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <Loading visible />
    </>
  );
};

export default AuthGoogleRedirect;
