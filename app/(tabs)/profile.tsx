import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { setUser as fetchUserFromAPI } from "../../apis/auth.api";
import { useNotification } from "../../contexts/notification-provider";
import { useAuthStore } from "../../stores/useAuthStore";

const Profile: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const { deletePushToken } = useNotification();

  // Fetch user if we have token but no user data
  useEffect(() => {
    if (token && !user) {
      fetchUserFromAPI()
        .then(setUser)
        .catch(console.error);
    }
  }, [token, user]);

  const handleLogout = async () => {
    await deletePushToken();
    logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>My Profile</Text>

        {user && (
          <View style={styles.userInfo}>
            {user.image && (
              <Image
                source={{ uri: user.image }}
                style={styles.profileImage}
              />
            )}
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.studentCode && (
              <Text style={styles.studentCode}>ID: {user.studentCode}</Text>
            )}
          </View>
        )}

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
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
  userInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B3A67",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  studentCode: {
    fontSize: 14,
    color: "#888",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
