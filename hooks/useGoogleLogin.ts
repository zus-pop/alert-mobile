import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { toast } from "sonner-native";

export function useGoogleLogin() {
  const login = async () => {
    const redirectUri = Linking.createURL("/auth");
    const authUrl = `${
      process.env.EXPO_PUBLIC_API_URL
    }/api/auth/google?path=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success") {
      //   console.log(result);
    } else {
      toast.info("Login cancelled or failed.");
    }
  };

  return {
    login,
  };
}
