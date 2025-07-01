import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { setUser as fetchUserFromAPI } from "../../apis/auth.api";
import { useNotification } from "../../contexts/notification-provider";
import { useAuthStore } from "../../stores/useAuthStore";
import myAxios from "../../utils/my-axios";
import { getStudentEnrollments, Enrollment } from "../../apis/enrollments.api";

const avatar = require("../../assets/images/avatar.png");
const bell = require("../../assets/images/bell.png");
const uiDesign = require("../../assets/images/uiDesign.png");
const uxDesign = require("../../assets/images/uxDesign.png");
const webDesign = require("../../assets/images/webDesign.png");
const wireframe = require("../../assets/images/wireframe.png");
const excel = require("../../assets/images/excel.png");
const weeklyRead = require("../../assets/images/weeklyRead.png");

interface Alert {
  _id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const HomeScreen: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { requestPushToken } = useNotification();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    requestPushToken();
  }, []);

  // Fetch user if we have token but no user data
  useEffect(() => {
    if (token && !user) {
      fetchUserFromAPI()
        .then(setUser)
        .catch(console.error);
    }
  }, [token, user]);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await myAxios.get('alerts');
        setAlerts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    if (token) {
      fetchAlerts();
    }
  }, [token]);

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?._id) return;
      try {
        const res = await getStudentEnrollments(user._id);
        setEnrollments(res.data || []);
      } catch (err) {
        setEnrollments([]);
      }
    };
    fetchEnrollments();
  }, [user?._id]);

  // Check if there are any alerts
  const hasAlerts = alerts.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Image
            source={user?.image ? { uri: user.image } : avatar}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.username}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.firstName || "User"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellWrap}
            onPress={() => router.push("/notifications")}
          >
            <Image source={bell} style={styles.bell} />
            {hasAlerts && (
              <View style={[styles.notiDot, styles.notiDotRed]} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput placeholder="Search.." style={styles.searchInput} />
      </View>

      {/* Featured Course */}
      <View style={styles.featuredCourse}>
        <Image source={uiDesign} style={styles.featuredImage} />
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredTitle}>UI Design Course</Text>
          <Text style={styles.featuredDesc}>2h 40min - 15 lesson</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
            <Text style={styles.progressText}>70</Text>
          </View>
        </View>
      </View>

      {/* My Course */}
      <Text style={styles.sectionTitle}>My Course</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.courseList}
      >
        {enrollments.map((enrollment) => (
          <View key={enrollment._id} style={styles.courseCard}>
            {enrollment.courseId?.image ? (
              <Image source={{ uri: enrollment.courseId.image }} style={styles.courseImage} />
            ) : (
              <View style={[styles.courseImage, { backgroundColor: "#F5F6FA" }]} />
            )}
            <Text style={styles.courseCardTitle}>
              {enrollment.courseId?.subjectId?.subjectName || "No name"}
            </Text>
            <Text style={styles.courseCardDesc}>
              {enrollment.courseId?.semesterId?.semesterName || ""}
            </Text>
            <TouchableOpacity style={styles.keepLearningBtn}>
              <Text style={styles.keepLearningText}>Keep learning</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.seeAllBtn}>
        <Text style={styles.seeAllText}>See All Courses</Text>
      </TouchableOpacity>

      {/* Weekly Reads */}
      <Text style={styles.sectionTitle}>Weekly Reads</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.readsList}
      >
        <View style={styles.readCard}>
          <Image source={excel} style={styles.readImage} />
          <View style={styles.readTextContainer}>
            <Text style={styles.readAuthor}>Rian Mendella</Text>
            <Text
              style={styles.readTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              How to improve Microsoft Excel Skills
            </Text>
          </View>
        </View>
        <View style={styles.readCard}>
          <Image source={weeklyRead} style={styles.readImage} />
          <View style={styles.readTextContainer}>
            <Text style={styles.readAuthor}>John Doe</Text>
            <Text
              style={styles.readTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Learning Tips for Designers
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  headerSafeArea: { backgroundColor: "#fff", paddingTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  welcome: { color: "#B0B0B0", fontSize: 16 },
  username: { color: "#2B3A67", fontWeight: "bold", fontSize: 20 },
  bellWrap: { position: "relative", marginLeft: 8 },
  bell: { width: 32, height: 32 },
  notiDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  notiDotRed: {
    backgroundColor: "#F55A5A",
  },
  searchBox: { marginVertical: 12 },
  searchInput: {
    backgroundColor: "#F5F6FA",
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 40,
    fontSize: 16,
  },
  featuredCourse: {
    flexDirection: "row",
    backgroundColor: "#7EC8E3",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  featuredImage: { width: 80, height: 60, borderRadius: 10, marginRight: 16 },
  featuredInfo: { flex: 1 },
  featuredTitle: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  featuredDesc: { color: "#E0F7FA", fontSize: 14, marginBottom: 8 },
  progressBarBg: {
    backgroundColor: "#B2EBF2",
    borderRadius: 8,
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: "#fff",
    width: "70%",
    height: 16,
    borderRadius: 8,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressText: {
    color: "#2B3A67",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: "auto",
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2B3A67",
    marginTop: 12,
    marginBottom: 8,
  },
  courseList: { flexDirection: "row", marginBottom: 8 },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    marginRight: 12,
    width: 180,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
  },
  courseCardTitle: { fontWeight: "bold", fontSize: 16, color: "#2B3A67" },
  courseCardDesc: { color: "#B0B0B0", fontSize: 13, marginBottom: 8 },
  keepLearningBtn: {
    backgroundColor: "#2B3A67",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  keepLearningText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  seeAllBtn: {
    alignSelf: "center",
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2B3A67",
  },
  seeAllText: { color: "#2B3A67", fontWeight: "bold", fontSize: 14 },
  readsList: { flexDirection: "row", marginBottom: 8 },
  readCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 220,
    height: 150,
  },
  readImage: { width: 100, height: 120, borderRadius: 10, marginRight: 10 },
  readTextContainer: { flex: 1, paddingRight: 8, overflow: "hidden" },
  readAuthor: { color: "#B0B0B0", fontSize: 12 },
  readTitle: { color: "#2B3A67", fontWeight: "bold", fontSize: 14 },
});
