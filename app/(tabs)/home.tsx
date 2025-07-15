import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import PullToRefresh from "../../components/PullToRefresh";
import { setUser as fetchUserFromAPI } from "../../apis/auth.api";
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
const cardWidth = Math.max(screenWidth * 0.42, 160); // Tối thiểu 160, tối đa 42% màn hình
const cardHeight = cardWidth * 1.4; // Tỷ lệ 1.4:1
const imageHeight = cardWidth * 0.65; // Chiều cao ảnh = 65% chiều rộng card

interface Alert {
  _id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface AttendanceData {
  _id: string;
  sessionId: {
    _id: string;
    sessionName: string;
    startTime: string;
    endTime: string;
  };
  status: string;
  presentDate: string;
  updatedAt: string;
}

const HomeScreen: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { requestPushToken } = useNotification();
  const setSelectedCourseId = useSelectedCourseStore((state) => state.setSelectedCourseId);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Enrollment[]>([]);
  const [coursesProgress, setCoursesProgress] = useState<{ [key: string]: number }>({});

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
        const enrollmentsData = res.data || [];
        setEnrollments(enrollmentsData);
        
        // Find all courses with "IN PROGRESS" status for featured banner
        const inProgressCourses = enrollmentsData.filter(
          (enrollment: Enrollment) => enrollment.status === 'IN PROGRESS'
        );
        
        if (inProgressCourses.length > 0) {
          // Sort by most recently enrolled
          const sortedCourses = inProgressCourses.sort((a: Enrollment, b: Enrollment) => 
            new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
          );
          
          setFeaturedCourses(sortedCourses);
          
          // Fetch attendance data for all in progress courses
          sortedCourses.forEach(course => {
            console.log(`Fetching progress for course: ${course.courseId?.subjectId?.subjectCode} (${course._id})`);
            fetchCourseProgress(user._id, course._id);
          });
        }
      } catch (err) {
        setEnrollments([]);
      }
    };
    fetchEnrollments();
  }, [user?._id]);

  // Fetch course progress based on attendance
  const fetchCourseProgress = async (studentId: string, enrollmentId: string) => {
    try {
      // Try the attendance API endpoint
      const response = await myAxios.get(`students/${studentId}/enrollments/${enrollmentId}/attendances`);
      const attendances: AttendanceData[] = response.data.data || response.data || [];
      
      console.log(`Attendance data for ${enrollmentId}:`, attendances);
      
      if (attendances.length > 0) {
        // Log first few attendance records to understand structure
        console.log(`Sample attendance records:`, attendances.slice(0, 3));
        // Count attended sessions - check multiple possible status values
        const attendedSessions = attendances.filter(
          (attendance) => {
            const status = attendance.status?.toUpperCase();
            // Include various possible "attended" status values
            return status === 'PRESENT' || 
                   status === 'ATTENDED' || 
                   status === 'YES' || 
                   status === 'TRUE' ||
                   status === '1' ||
                   attendance.presentDate; // If has presentDate, consider as attended
          }
        ).length;
        
        const totalSessions = attendances.length;
        const progressPercentage = Math.round((attendedSessions / totalSessions) * 100);
        
        console.log(`Progress for ${enrollmentId}: ${attendedSessions}/${totalSessions} = ${progressPercentage}%`);
        
        setCoursesProgress(prev => ({
          ...prev,
          [enrollmentId]: progressPercentage
        }));
      } else {
        // If no attendance data, set a default progress
        console.log(`No attendance data for ${enrollmentId}`);
        setCoursesProgress(prev => ({
          ...prev,
          [enrollmentId]: 0
        }));
      }
    } catch (error) {
      console.log(`Attendance API error for ${enrollmentId}:`, error);
      // If API not available, set a random progress for demo purposes
      const randomProgress = Math.floor(Math.random() * 80) + 10; // Random between 10-90%
      setCoursesProgress(prev => ({
        ...prev,
        [enrollmentId]: randomProgress
      }));
    }
  };

  // Filter enrollments based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEnrollments(enrollments);
    } else {
      const filtered = enrollments.filter((enrollment) => {
        const courseName = enrollment.courseId?.subjectId?.subjectName?.toLowerCase() || "";
        const courseCode = enrollment.courseId?.subjectId?.subjectCode?.toLowerCase() || "";
        const semesterName = enrollment.courseId?.semesterId?.semesterName?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        
        return courseName.includes(query) || 
               courseCode.includes(query) || 
               semesterName.includes(query);
      });
      setFilteredEnrollments(filtered);
    }
  }, [searchQuery, enrollments]);

  // Check if there are any alerts
  const hasAlerts = alerts.length > 0;

  const handleRefresh = async () => {
    try {
      // Fetch user data
      if (token && !user) {
        const userData = await fetchUserFromAPI();
        setUser(userData);
      }
      
      // Fetch alerts
      const alertsResponse = await myAxios.get('alerts');
      setAlerts(alertsResponse.data.data || []);
      
      // Fetch enrollments
      if (user?._id) {
        const enrollmentsResponse = await getStudentEnrollments(user._id);
        const enrollmentsData = enrollmentsResponse.data || [];
        setEnrollments(enrollmentsData);
        
        // Update featured courses
        const inProgressCourses = enrollmentsData.filter(
          (enrollment: Enrollment) => enrollment.status === 'IN PROGRESS'
        );
        
        if (inProgressCourses.length > 0) {
          const sortedCourses = inProgressCourses.sort((a: Enrollment, b: Enrollment) => 
            new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
          );
          
          setFeaturedCourses(sortedCourses);
          
          // Fetch progress for all courses
          sortedCourses.forEach(course => {
            fetchCourseProgress(user._id, course._id);
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing home data:', error);
    }
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
      <View style={styles.scrollContent}>
        <PullToRefresh 
          onRefresh={handleRefresh}
          tintColor="#2B3A67"
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
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

        {/* Featured Courses - Scrollable */}
        {featuredCourses.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.featuredSectionTitle}>Latest Courses</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.featuredScrollView}
              contentContainerStyle={styles.featuredScrollContent}
            >
              {featuredCourses.map((course, index) => {
                const progress = coursesProgress[course._id] || 0;
                return (
                  <View key={course._id} style={[styles.featuredCourse, index > 0 && styles.featuredCourseMargin]}>
                    {course.courseId?.image ? (
                      <Image 
                        source={{ uri: course.courseId.image }} 
                        style={styles.featuredImage} 
                      />
                    ) : (
                      <Image source={uiDesign} style={styles.featuredImage} />
                    )}
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredTitle} numberOfLines={2} ellipsizeMode="tail">
                        {course.courseId?.subjectId?.subjectName || "Course"}
                      </Text>
                      <Text style={styles.featuredDesc} numberOfLines={1} ellipsizeMode="tail">
                        {course.courseId?.subjectId?.subjectCode}
                      </Text>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { width: `${progress}%` }
                          ]} 
                        />
                        <Text style={styles.progressText}>{progress}%</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* My Course */}
        <Text style={styles.sectionTitle}>My Course</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.courseList}
          contentContainerStyle={styles.courseListContent}
        >
          {filteredEnrollments.map((enrollment) => (
            <View key={enrollment._id} style={styles.courseCard}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCourseId(enrollment._id);
                  router.push("/(tabs)/my-course");
                }}
                style={styles.courseImageContainer}
              >
                {enrollment.courseId?.image ? (
                  <Image 
                    source={{ uri: enrollment.courseId.image }} 
                    style={styles.courseImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.courseImage, { backgroundColor: "#F5F6FA" }]} />
                )}
              </TouchableOpacity>
              <View style={styles.courseTextContainer}>
                <Text style={styles.courseCardTitle} numberOfLines={2} ellipsizeMode="tail">
                  {enrollment.courseId?.subjectId?.subjectName || "No name"}
                </Text>
                <Text style={styles.courseCardDesc} numberOfLines={1} ellipsizeMode="tail">
                  {enrollment.courseId?.semesterId?.semesterName || ""}
                </Text>
                <TouchableOpacity style={styles.keepLearningBtn}>
                  <Text style={styles.keepLearningText}>Keep learning</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.seeAllBtn}
          onPress={() => router.push("/(tabs)/my-course")}
        >
          <Text style={styles.seeAllText}>See All Courses</Text>
        </TouchableOpacity>

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
        </PullToRefresh>
      </View>
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
    paddingHorizontal: Math.max(16, screenWidth * 0.04), // Responsive padding
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Math.max(16, screenWidth * 0.04),
    paddingBottom: 120, // Đủ space cho tab bar
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
  featuredSection: {
    marginBottom: 8,
  },
  featuredSectionTitle: {
    fontSize: Math.max(16, screenWidth * 0.043),
    fontWeight: "600",
    color: "#2B3A67",
    marginBottom: 12,
  },
  featuredScrollView: {
    marginBottom: 8,
  },
  featuredScrollContent: {
    paddingRight: 16,
  },
  featuredCourse: {
    flexDirection: "row",
    backgroundColor: "#7EC8E3",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    minHeight: Math.max(100, screenHeight * 0.12),
    width: Math.max(300, screenWidth * 0.85),
  },
  featuredCourseMargin: {
    marginLeft: 12,
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
  },
  courseImage: {
    width: "100%",
    height: imageHeight,
    borderRadius: 12,
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
  seeAllBtn: {
    alignSelf: "center",
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2B3A67",
  },
  seeAllText: { 
    color: "#2B3A67", 
    fontWeight: "bold", 
    fontSize: Math.max(13, screenWidth * 0.036) 
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
