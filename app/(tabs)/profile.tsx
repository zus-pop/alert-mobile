import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";

const Profile: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.placeholder}>This is the My Profile screen.</Text>
        <Pressable
          onPress={() => {
            logout();
            router.replace("/");
          }}
        >
          <Text style={styles.placeholder}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B3A67",
    marginBottom: 12,
  },
  placeholder: { fontSize: 16, color: "#B0B0B0" },
});
