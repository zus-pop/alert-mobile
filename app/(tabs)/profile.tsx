import { router } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useNotification } from "../../contexts/notification-provider";
import { useAuthStore } from "../../stores/useAuthStore";

const avatar = require("../../assets/images/avatar.png");

const Profile: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const { deletePushToken } = useNotification();

  const handleLogout = async () => {
    await deletePushToken();
    logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.settingsBtn}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileSection}>
            <View style={styles.grayBanner} />
            <View style={styles.avatarContainer}>
              <Image source={avatar} style={styles.avatar} />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.name}>Nguyen Quoc Huy</Text>
              <Text style={styles.userId}>SE180111</Text>
              <Text style={styles.description}>
                Pick Your Next Challenge Pick Your Next Pick Your Next Challenge
              </Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Course</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pass</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fail</Text>
            </View>
          </View>

          {/* Latest Course Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Course</Text>
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={styles.filterIcon}>⚹</Text>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Course List Placeholder */}
          <View style={styles.courseListPlaceholder}>
            <Text style={styles.placeholderText}>No courses yet</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>💬</Text>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>📚</Text>
          <Text style={styles.navText}>My Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.activeNavIcon}>👤</Text>
          <Text style={styles.activeNavText}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F6FA" 
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsIcon: {
    fontSize: 22,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  grayBanner: {
    height: 120,
    backgroundColor: "#E5E5E5",
    borderRadius: 20,
    marginBottom: -60,
  },
  avatarContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
    zIndex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  userInfoContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2B3A67",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  userId: {
    fontSize: 16,
    color: "#B0B0B0",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "left", // Left align text
    lineHeight: 22,
    alignSelf: "flex-start",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: "#2B3A67",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B3A67",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
    color: "#2B3A67",
  },
  filterText: {
    fontSize: 14,
    color: "#2B3A67",
    fontWeight: "500",
  },
  courseListPlaceholder: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 60,
    alignItems: "center",
    marginBottom: 100,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: "#B0B0B0",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: "#E8F4FD",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  navText: {
    fontSize: 12,
    color: "#B0B0B0",
    marginTop: 4,
  },
  activeNavText: {
    fontSize: 12,
    color: "#2B3A67",
    fontWeight: "600",
    marginTop: 4,
  },
  activeNavIcon: {
    fontSize: 16,
    color: "#2B3A67",
  },
});