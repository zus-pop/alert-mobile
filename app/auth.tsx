import { router, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../stores";

const AuthGoogleRedirect = () => {
  const { access_token } = useGlobalSearchParams();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    if (access_token) {
      if (access_token) {
        setToken(access_token as string);
        router.replace("/home");
      }
    }
  }, [access_token]);

  return null;
};

export default AuthGoogleRedirect;
