import { router } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { setUser as fetchUserFromAPI } from "../../apis/auth.api";
import { CourseData, getCourses } from "../../apis/courses.api";
import { Enrollment, getStudentEnrollments } from "../../apis/enrollments.api";
import { useNotification } from "../../contexts/notification-provider";
import { useAuthStore } from "../../stores/useAuthStore";
import { useSelectedCourseStore } from "../../stores/useSelectedCourseStore";
import myAxios from "../../utils/my-axios";

const avatar = require("../../assets/images/avatar.png");
const bell = require("../../assets/images/bell.png");
const uiDesign = require("../../assets/images/uiDesign.png");
const uxDesign = require("../../assets/images/uxDesign.png");
const webDesign = require("../../assets/images/webDesign.png");
const wireframe = require("../../assets/images/wireframe.png");
const excel = require("../../assets/images/excel.png");
const weeklyRead = require("../../assets/images/weeklyRead.png");

// Lấy kích thước màn hình
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Tính toán kích thước responsive
const cardWidth = Math.max(screenWidth * 0.42, 160);
const cardHeight = cardWidth * 1.4;
const imageHeight = cardWidth * 0.65;

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
  const setSelectedCourseId = useSelectedCourseStore((state) => state.setSelectedCourseId);
  
  // States
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

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

  // Fetch all courses using your existing API
  useEffect(() => {
    const fetchAllCourses = async () => {
      if (!token) return;
      
      try {
        setLoadingCourses(true);
        const response = await getCourses();
        setAllCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setAllCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    
    fetchAllCourses();
  }, [token]);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(allCourses);
    } else {
      const query = searchQuery.toLowerCase();
      
      const filtered = allCourses.filter((course) => {
        const courseName = course.subjectId?.subjectName?.toLowerCase() || "";
        const courseCode = course.subjectId?.subjectCode?.toLowerCase() || "";
        const semesterName = course.semesterId?.semesterName?.toLowerCase() || "";
        
        return courseName.includes(query) || 
               courseCode.includes(query) || 
               semesterName.includes(query);
      });
      
      setFilteredCourses(filtered);
    }
  }, [searchQuery, allCourses]);

  // Check if there are any alerts
  const hasAlerts = alerts.length > 0;

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.courseId._id === courseId);
  };

  // Get course images (you can customize this logic)
  const getCourseImage = (course: CourseData | Enrollment['courseId']) => {
    // You can add logic here to return different images based on course type
    const images = [uiDesign, uxDesign, webDesign, wireframe];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  // Render course card
  const renderCourseCard = (course: CourseData) => {
    const isEnrolled = isEnrolledInCourse(course._id);
    
    return (
      <View key={course._id} style={styles.courseCard}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/course-info",
              params: { courseId: course._id }
            });
          }}
          style={styles.courseImageContainer}
        >
          <Image 
            source={getCourseImage(course)} 
            style={styles.courseImage}
            resizeMode="cover"
          />
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledBadgeText}>Enrolled</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.courseTextContainer}>
          <Text style={styles.courseCardTitle} numberOfLines={2} ellipsizeMode="tail">
            {course.subjectId?.subjectName || "No name"}
          </Text>
          <Text style={styles.courseCardDesc} numberOfLines={1} ellipsizeMode="tail">
            {course.subjectId?.subjectCode || ""} • {course.semesterId?.semesterName || ""}
          </Text>
          <TouchableOpacity 
            style={[
              styles.keepLearningBtn,
              isEnrolled ? {} : { backgroundColor: "#4CAF50" }
            ]}
            onPress={() => {
              router.push({
                pathname: "/course-info",
                params: { courseId: course._id }
              });
            }}
          >
            <Text style={styles.keepLearningText}>
              {isEnrolled ? "View Course" : "View Course"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Image
            source={user?.image ? { uri: user.image } : avatar}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Welcome</Text>
            <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
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

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput 
            placeholder="Search courses..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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

        {/* All Courses Section */}
        <Text style={styles.sectionTitle}>
          All Courses ({filteredCourses.length})
        </Text>

        {loadingCourses ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B3A67" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.courseList}
            contentContainerStyle={styles.courseListContent}
          >
            {filteredCourses.map(renderCourseCard)}
          </ScrollView>
        )}

        {/* Weekly Reads */}
        <Text style={styles.sectionTitle}>Weekly Reads</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.readsList}
          contentContainerStyle={styles.readsListContent}
        >
          <View style={styles.readCard}>
            <Image source={excel} style={styles.readImage} resizeMode="cover" />
            <View style={styles.readTextContainer}>
              <Text style={styles.readAuthor}>Rian Mendella</Text>
              <Text
                style={styles.readTitle}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                How to improve Microsoft Excel Skills
              </Text>
            </View>
          </View>
          <View style={styles.readCard}>
            <Image source={weeklyRead} style={styles.readImage} resizeMode="cover" />
            <View style={styles.readTextContainer}>
              <Text style={styles.readAuthor}>John Doe</Text>
              <Text
                style={styles.readTitle}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                Learning Tips for Designers
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff",
  },
  headerSafeArea: { 
    backgroundColor: "#fff", 
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === 'ios' ? 16 : 8,
    marginBottom: 8,
    paddingHorizontal: Math.max(16, screenWidth * 0.04),
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Math.max(16, screenWidth * 0.04),
    paddingBottom: 120,
  },
  avatar: { 
    width: Math.min(56, screenWidth * 0.14), 
    height: Math.min(56, screenWidth * 0.14), 
    borderRadius: Math.min(28, screenWidth * 0.07), 
    marginRight: 12 
  },
  welcome: { 
    color: "#B0B0B0", 
    fontSize: Math.max(14, screenWidth * 0.04)
  },
  username: { 
    color: "#2B3A67", 
    fontWeight: "bold", 
    fontSize: Math.max(18, screenWidth * 0.05),
    flex: 1,
  },
  bellWrap: { 
    position: "relative", 
    marginLeft: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 8,
    backgroundColor: "#FAFAFA",
  },
  bell: { 
    width: Math.min(24, screenWidth * 0.06), 
    height: Math.min(24, screenWidth * 0.06) 
  },
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
  searchBox: { 
    marginVertical: 12 
  },
  searchInput: {
    backgroundColor: "#F5F6FA",
    borderRadius: 24,
    paddingHorizontal: 20,
    height: Math.max(40, screenHeight * 0.05),
    fontSize: Math.max(14, screenWidth * 0.04),
  },
  featuredCourse: {
    flexDirection: "row",
    backgroundColor: "#7EC8E3",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
    minHeight: Math.max(100, screenHeight * 0.12),
  },
  featuredImage: { 
    width: Math.max(80, screenWidth * 0.2), 
    height: Math.max(60, screenWidth * 0.15), 
    borderRadius: 10, 
    marginRight: 16 
  },
  featuredInfo: { 
    flex: 1,
    justifyContent: "center",
  },
  featuredTitle: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: Math.max(16, screenWidth * 0.045) 
  },
  featuredDesc: { 
    color: "#E0F7FA", 
    fontSize: Math.max(12, screenWidth * 0.035), 
    marginBottom: 8 
  },
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
    fontSize: Math.max(10, screenWidth * 0.03),
    marginLeft: "auto",
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: Math.max(18, screenWidth * 0.05),
    color: "#2B3A67",
    marginTop: 16,
    marginBottom: 12,
  },
  courseList: { 
    marginBottom: 8,
  },
  courseListContent: {
    paddingRight: 16,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    marginRight: 12,
    width: cardWidth,
    height: cardHeight,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    justifyContent: 'space-between',
  },
  courseImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  courseImage: {
    width: "100%",
    height: imageHeight,
    borderRadius: 12,
  },
  enrolledBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  courseCardTitle: { 
    fontWeight: "bold", 
    fontSize: Math.max(14, screenWidth * 0.038), 
    color: "#2B3A67",
    lineHeight: Math.max(18, screenWidth * 0.048),
  },
  courseCardDesc: { 
    color: "#B0B0B0", 
    fontSize: Math.max(11, screenWidth * 0.03), 
    marginVertical: 4,
  },
  keepLearningBtn: {
    backgroundColor: "#2B3A67",
    borderRadius: 8,
    paddingVertical: Math.max(8, screenHeight * 0.01),
    alignItems: "center",
    marginTop: 4,
  },
  keepLearningText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: Math.max(12, screenWidth * 0.035) 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: Math.max(14, screenWidth * 0.04),
    color: "#666",
  },
  readsList: { 
    marginBottom: 16,
  },
  readsListContent: {
    paddingRight: 16,
  },
  readCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: Math.max(240, screenWidth * 0.65),
    minHeight: Math.max(120, screenHeight * 0.15),
  },
  readImage: { 
    width: Math.max(80, screenWidth * 0.2), 
    height: Math.max(100, screenWidth * 0.25), 
    borderRadius: 10, 
    marginRight: 12,
    flex: 0,
  },
  readTextContainer: { 
    flex: 1, 
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  readAuthor: { 
    color: "#B0B0B0", 
    fontSize: Math.max(11, screenWidth * 0.03),
    marginBottom: 4,
  },
  readTitle: { 
    color: "#2B3A67", 
    fontWeight: "bold", 
    fontSize: Math.max(13, screenWidth * 0.035),
    lineHeight: Math.max(16, screenWidth * 0.042),
  },
});
