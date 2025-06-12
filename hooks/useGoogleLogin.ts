import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export function useGoogleLogin() {
  const login = async () => {
    const redirectUri = Linking.createURL("/auth");
    const authUrl = `${
      process.env.EXPO_PUBLIC_API_URL
    }/api/auth/google?path=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success" && result.url) {
      console.log("success");
    } else {
      console.log("Login cancelled or failed.");
    }
  };

  return {
    login,
  };
}
