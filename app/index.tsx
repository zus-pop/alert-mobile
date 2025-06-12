import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { useAuthStore } from "../stores/useAuthStore";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  useEffect(() => {
    if (token) {
      router.replace("/(tabs)/home");
    }
  }, []);
  const { login } = useGoogleLogin();

  return (
    <View style={styles.container}>
      {/* Main Illustration Banner */}
      <Image
        source={require("@/assets/images/banner.png")}
        style={styles.banner}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>EWS</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Pick Your Next Challenge Pick Your Next Pick Your Next Challenge
      </Text>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up Button Placeholder */}
      <View style={styles.signUpButton}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </View>

      {/* Or Divider */}
      <Text style={styles.orText}>or</Text>

      {/* Social Login with Google */}
      <TouchableOpacity onPress={login}>
        <View style={styles.socialLoginPlaceholder}>
          <Image
            source={require("@/assets/images/google.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00b4d8",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  banner: {
    marginTop: 40,
    width: 220,
    height: 200,
    borderRadius: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 64,
    color: "#fff",
    fontWeight: "800",
    fontFamily: "Montserrat",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Roboto",
    textAlign: "center",
    marginHorizontal: 24,
    marginBottom: 32,
  },
  signInButton: {
    width: 220,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    opacity: 0.7,
  },
  signInButtonText: {
    color: "#272323",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },
  signUpButton: {
    width: 220,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Montserrat",
  },
  orText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Montserrat",
    marginBottom: 16,
  },
  socialLoginPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  googleIcon: {
    width: 600,
    marginLeft: 40,
  },
});
