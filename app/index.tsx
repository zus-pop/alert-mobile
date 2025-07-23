import { router } from "expo-router";
import { useEffect } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { setUser as fetchUserFromAPI } from "../apis/auth.api";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { useAuthStore } from "../stores/useAuthStore";

export default function Index() {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Only fetch user if we have token but no user data
    if (token && !user) {
      fetchUserFromAPI()
        .then(setUser)
        .catch(console.error);
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user) {
      router.replace("/(tabs)/home");
    }
  }, [token, user]);

  const { login } = useGoogleLogin();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/banner.png")}
          style={styles.banner}
          resizeMode="contain"
        />

        <Text style={styles.title}>EWS</Text>

        <Text style={styles.subtitle}>
          Pick Your Next Challenge Pick Your Next Pick Your Next Challenge
        </Text>

        {/* <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </View>

        <Text style={styles.orText}>or</Text> */}

        <TouchableOpacity onPress={login}>
          <View style={styles.socialLoginPlaceholder}>
            <Image
              source={require("@/assets/images/google.png")}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.signInButtonText}>Login with Google</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00b4d8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingBottom: 20,
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

  signInButtonText: {
    marginLeft: 30,
    color: "#272323",
    fontSize: 20,
    fontWeight: "700",
    justifyContent: "center",
    fontFamily: "Montserrat",
    marginBottom: 2,
  },

  orText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Montserrat",
    marginBottom: 16,
  },
  socialLoginPlaceholder: {
    width: 300,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",

    justifyContent: "center",
    marginBottom: 16,
  },
  googleIcon: {
    position: "absolute",
    width: 600,
    height: 80,
    marginRight: 150,
  },
});
