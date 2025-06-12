import React from "react";
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
import { useAuthStore } from "../../stores/useAuthStore";

const avatar = require("../../assets/images/avatar.png");
const bell = require("../../assets/images/bell.png");
const uiDesign = require("../../assets/images/uiDesign.png");
const uxDesign = require("../../assets/images/uxDesign.png");
const webDesign = require("../../assets/images/webDesign.png");
const wireframe = require("../../assets/images/wireframe.png");
const excel = require("../../assets/images/excel.png");
const weeklyRead = require("../../assets/images/weeklyRead.png");

const HomeScreen: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Image source={avatar} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.username}>Nguyen Quoc Huy</Text>
          </View>
          <View style={styles.bellWrap}>
            <Image source={bell} style={styles.bell} />
            <View style={styles.notiDot} />
          </View>
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
        <View style={styles.courseCard}>
          <Image source={uxDesign} style={styles.courseImage} />
          <Text style={styles.courseCardTitle}>UX Design Course</Text>
          <Text style={styles.courseCardDesc}>2h 40min - 15 lesson</Text>
          <TouchableOpacity style={styles.keepLearningBtn}>
            <Text style={styles.keepLearningText}>Keep learning</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.courseCard}>
          <Image source={webDesign} style={styles.courseImage} />
          <Text style={styles.courseCardTitle}>Web Design Course</Text>
          <Text style={styles.courseCardDesc}>4h 30min - 24 lesson</Text>
          <TouchableOpacity style={styles.keepLearningBtn}>
            <Text style={styles.keepLearningText}>Keep learning</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.courseCard}>
          <Image source={wireframe} style={styles.courseImage} />
          <Text style={styles.courseCardTitle}>Wireframe Course</Text>
          <Text style={styles.courseCardDesc}>5h 10min - 18 lesson</Text>
          <TouchableOpacity style={styles.keepLearningBtn}>
            <Text style={styles.keepLearningText}>Keep learning</Text>
          </TouchableOpacity>
        </View>
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

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>My Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>My Profile</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#F55A5A",
    borderWidth: 2,
    borderColor: "#fff",
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: 24,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  navItem: { alignItems: "center", flex: 1 },
  navText: { color: "#B0B0B0", fontSize: 13 },
  navTextActive: { color: "#2B3A67", fontWeight: "bold", fontSize: 13 },
});
