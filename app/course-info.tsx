import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { CourseData, getCourseById } from '../apis/courses.api';
import { Enrollment, getStudentEnrollments } from '../apis/enrollments.api';
import { 
  getStudentEnrollmentById, 
  getStudentAttendances, 
  StudyProgress, 
  AttendanceRecord,
  StudentEnrollment 
} from '../apis/students.api';
import { useAuthStore } from '../stores/useAuthStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CourseInfoProps {}

const CourseInfo: React.FC<CourseInfoProps> = () => {
  const { courseId, enrollmentId } = useLocalSearchParams<{ courseId: string; enrollmentId?: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [studentEnrollment, setStudentEnrollment] = useState<StudentEnrollment | null>(null);
  const [studyProgress, setStudyProgress] = useState<StudyProgress | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!courseId) {
          setError('Course ID is required.');
          return;
        }

        if (!user?._id) {
          setError('User not authenticated.');
          return;
        }

        // Fetch course details
        const courseResponse = await getCourseById(courseId);
        const courseData = courseResponse.data || courseResponse;
        
        if (!courseData) {
          setError('Course data not found.');
          return;
        }
        
        setCourse(courseData);

        // Find user's enrollment for this course
        const enrollmentsResponse = await getStudentEnrollments(user._id);
        const userEnrollment = enrollmentsResponse.data.find(
          (enr) => enr.courseId?._id === courseId
        );

        if (!userEnrollment) {
          setError('You are not enrolled in this course.');
          return;
        }

        setEnrollment(userEnrollment);

        // Fetch detailed student enrollment data
        try {
          const studentEnrollmentResponse = await getStudentEnrollmentById(user._id, userEnrollment._id);
          
          const enrollmentData = studentEnrollmentResponse.data || studentEnrollmentResponse;
          
          setStudentEnrollment(enrollmentData);
        } catch (studentEnrollmentError) {
          console.error('Error fetching student enrollment details:', studentEnrollmentError);
          // Continue even if this fails
        }

        // // Fetch study progress
        // try {
        //   const progressResponse = await getStudyProgress(user._id, userEnrollment._id);
        //   setStudyProgress(progressResponse.data);
        // } catch (progressError) {
        //   console.error('Error fetching study progress:', progressError);
        //   // Set default values if API call fails
        //   setStudyProgress({
        //     enrollmentId: userEnrollment._id,
        //     totalSessions: 20,
        //     attendedSessions: 17,
        //     attendanceRate: 87,
        //     presentCount: 15,
        //     absentCount: 3,
        //     lateCount: 2,
        //     overallGrade: 8.5,
        //     grades: [
        //       { type: 'Project', weight: 0.2, score: 4.5 },
        //       { type: 'PE', weight: 0.3, score: 8.5 },
        //       { type: 'PT', weight: 0.2, score: 6.0 },
        //       { type: 'FE', weight: 0.3, score: 7.5 },
        //     ],
        //     status: 'IN PROGRESS'
        //   });
        // }

        // Fetch attendance records
        try {
          const attendanceResponse = await getStudentAttendances(user._id, userEnrollment._id);
          setAttendances(attendanceResponse.data);
        } catch (attendanceError) {
          console.error('Error fetching attendance records:', attendanceError);
          // Continue even if this fails
        }

      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user?._id]);

  // Calculate attendance statistics from actual attendance records
  const calculateAttendanceStats = () => {
    if (!attendances || attendances.length === 0) {
      return {
        totalSessions: studyProgress?.totalSessions || 20,
        presentCount: studyProgress?.presentCount || 0,
        absentCount: studyProgress?.absentCount || 0,
        lateCount: studyProgress?.lateCount || 0,
        notYetCount: 20,
        attendanceRate: studyProgress?.attendanceRate || 0
      };
    }

    const presentCount = attendances.filter(att => att.status === 'PRESENT').length;
    const absentCount = attendances.filter(att => att.status === 'ABSENT').length;
    const lateCount = attendances.filter(att => att.status === 'LATE').length;
    const notYetCount = attendances.filter(att => att.status === 'NOT YET').length;
    const totalSessions = attendances.length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      notYetCount,
      attendanceRate
    };
  };

  // Render circular progress indicator with multi-layer design
  const renderCircularProgress = (percentage: number, size: number = 170) => {
    const centerX = 93;
    const centerY = 93;
    const radius1 = 85;
    const radius2 = 69;
    const radius3 = 53;
    const radius4 = 37;
    
    const circumference1 = 2 * Math.PI * radius1;
    const circumference2 = 2 * Math.PI * radius2;
    const circumference3 = 2 * Math.PI * radius3;
    const circumference4 = 2 * Math.PI * radius4;
    
    const attendanceStats = calculateAttendanceStats();
    
    // Calculate stroke dash arrays for each layer
    const presentStroke = attendanceStats.totalSessions > 0 ? (attendanceStats.presentCount / attendanceStats.totalSessions) * circumference1 : 0;
    const absentStroke = attendanceStats.totalSessions > 0 ? (attendanceStats.absentCount / attendanceStats.totalSessions) * circumference2 : 0;
    const lateStroke = attendanceStats.totalSessions > 0 ? (attendanceStats.lateCount / attendanceStats.totalSessions) * circumference3 : 0;
    const notYetStroke = attendanceStats.totalSessions > 0 ? (attendanceStats.notYetCount / attendanceStats.totalSessions) * circumference4 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 186 186">
            {/* Background circle */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius1}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Present (dark blue) - outermost layer */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius1}
              fill="none"
              stroke="#03045E"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${presentStroke} ${circumference1}`}
              strokeDashoffset={circumference1 / 4}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
            {/* Absent (medium blue) */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius2}
              fill="none"
              stroke="#0077B6"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${absentStroke} ${circumference2}`}
              strokeDashoffset={circumference2 / 4}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
            {/* Late (light blue) */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius3}
              fill="none"
              stroke="#00B4D8"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${lateStroke} ${circumference3}`}
              strokeDashoffset={circumference3 / 4}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
            {/* Not Yet (lightest blue) */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius4}
              fill="none"
              stroke="#90E0EF"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${notYetStroke} ${circumference4}`}
              strokeDashoffset={circumference4 / 4}
              transform={`rotate(-90 ${centerX} ${centerY})`}
            />
          </Svg>
          {/* Center percentage */}
          <View style={styles.progressCenter}>
            <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
          </View>
        </View>
        
        {/* Side numbers */}
        <View style={styles.sideNumbers}>
          <View style={[styles.sideNumber, { backgroundColor: '#03045E' }]}>
            <Text style={styles.sideNumberText}>{attendanceStats.presentCount}</Text>
          </View>
          <View style={[styles.sideNumber, { backgroundColor: '#0077B6' }]}>
            <Text style={styles.sideNumberText}>{attendanceStats.absentCount}</Text>
          </View>
          <View style={[styles.sideNumber, { backgroundColor: '#00B4D8' }]}>
            <Text style={styles.sideNumberText}>{attendanceStats.lateCount}</Text>
          </View>
          <View style={[styles.sideNumber, { backgroundColor: '#90E0EF' }]}>
            <Text style={styles.sideNumberText}>{attendanceStats.notYetCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render grade bars with actual data
  const renderGradeBars = () => {
    // Check if we have actual grade data
    if (!studentEnrollment?.grade || studentEnrollment.grade.length === 0) {
      return (
        <View style={styles.noGradeContainer}>
          <Ionicons name="school-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noGradeText}>No grades available yet</Text>
          <Text style={styles.noGradeSubtext}>Grades will appear here once they are recorded</Text>
        </View>
      );
    }

    const grades = studentEnrollment.grade;
    const maxScore = 10;

    return (
      <View style={styles.gradeContainer}>
        {grades.map((grade, index) => (
          <View key={index} style={styles.gradeItem}>
            <View style={styles.gradeBarContainer}>
              <View 
                style={[
                  styles.gradeBar, 
                  { 
                    height: `${Math.max((grade.score / maxScore) * 100, 4)}%`, // Minimum 4% height for visibility
                    backgroundColor: grade.score >= 8 ? '#4DAF00' : grade.score >= 6 ? '#FFA500' : grade.score > 0 ? '#2196F3' : '#E5E7EB'
                  }
                ]} 
              />
              <Text style={styles.gradeScore}>{grade.score.toFixed(1)}</Text>
            </View>
            <Text style={styles.gradeLabel}>{grade.type}</Text>
            <Text style={styles.gradeWeight}>({Math.round(grade.weight * 100)}%)</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render success chart with wave pattern
  const renderSuccessChart = () => {
    return (
      <View style={styles.successChartContainer}>
        <Svg width="100%" height={96} viewBox="0 0 392 96" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="successGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#4DAF00" stopOpacity="0.38" />
              <Stop offset="100%" stopColor="white" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* Area fill */}
          <Path
            d="M0 80 Q50 60 100 65 T200 55 T300 45 T392 35 L392 96 L0 96 Z"
            fill="url(#successGradient)"
          />
          
          {/* Line */}
          <Path
            d="M0 80 Q50 60 100 65 T200 55 T300 45 T392 35"
            stroke="#52AC0B"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const overallGrade = studentEnrollment?.finalGrade || 
    (studentEnrollment?.grade && studentEnrollment.grade.length > 0 
      ? studentEnrollment.grade.reduce((sum, g) => sum + (g.score * g.weight), 0) 
      : 0);

  // Format overall grade for display
  const formatOverallGrade = (grade: number) => {
    if (grade === 0) return 'N/A';
    return grade.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>09:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={16} color="#000" />
          <Ionicons name="wifi" size={16} color="#000" />
          <View style={styles.batteryIcon}>
            <View style={styles.batteryBody} />
            <View style={styles.batteryTip} />
          </View>
        </View>
      </View>
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Hi, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Nguyễn Quốc Huy'}
            </Text>
            <View style={styles.avatarContainer}>
              <Image
                source={user?.image ? { uri: user.image } : require('../assets/images/avatar.png')}
                style={styles.avatar}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Your Study Progress</Text>
        </View>

        {/* Progress Chart Section */}
        <View style={styles.progressSection}>
          {renderCircularProgress(attendanceStats.attendanceRate, 170)}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#03045E' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0077B6' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00B4D8' }]} />
            <Text style={styles.legendText}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#90E0EF' }]} />
            <Text style={styles.legendText}>Not Yet</Text>
          </View>
        </View>

        {/* Mark Report Card */}
        <View style={styles.markReportCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitle}>
              <Ionicons name="bar-chart-outline" size={20} color="#000" />
              <Text style={styles.cardTitle}>Mark Report</Text>
            </View>
            <Text style={styles.cardSubtitle}>Component grade of the course</Text>
          </View>

          {/* Chart Body */}
          <View style={styles.chartBody}>
            {renderGradeBars()}
          </View>

          {/* Success Footer */}
          <View style={styles.successFooter}>
            <View style={styles.successContent}>
              <Text style={styles.successText}>
                {overallGrade === 0 ? 'No grades recorded yet' :
                 overallGrade >= 8 ? 'Well done! Your grades are amazing!' : 
                 overallGrade >= 6 ? 'Good job! Keep up the good work!' : 
                 'Keep working hard to improve your grades!'}
              </Text>
              <Text style={styles.overallScore}>{formatOverallGrade(overallGrade)}</Text>
            </View>
            {renderSuccessChart()}
          </View>
        </View>

        {/* Course Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="book-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>
                  {course?.subjectId?.subjectName || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="code-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Course Code</Text>
                <Text style={styles.detailValue}>
                  {course?.subjectId?.subjectCode || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Semester</Text>
                <Text style={styles.detailValue}>
                  {course?.semesterId?.semesterName || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="stats-chart-outline" size={20} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Attendance</Text>
                <Text style={styles.detailValue}>
                  {attendanceStats.presentCount}/{attendanceStats.totalSessions} sessions ({attendanceStats.attendanceRate}%)
                </Text>
              </View>
            </View>
            
            {enrollment && (
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#22C55E" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: '#22C55E' }]}>
                    {enrollment.status}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  timeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryIcon: {
    position: 'relative',
    width: 24,
    height: 12,
  },
  batteryBody: {
    width: 20,
    height: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
    backgroundColor: '#000000',
  },
  batteryTip: {
    position: 'absolute',
    right: -2,
    top: 4,
    width: 2,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 1,
  },
  headerContainer: {
    marginHorizontal: 8,
    marginTop: 8,
  },
  header: {
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    flex: 1, 
    marginRight: 16,
  },
  avatarContainer: {
    width: 60, 
    height: 60,
    borderRadius: 30, 
    overflow: 'hidden',
    borderWidth: 2, // Add border for better definition
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 48,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 200, // Add minimum height to prevent overflow
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Ensure full width
    maxWidth: screenWidth - 40, // Prevent overflow
  },
  progressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  sideNumbers: {
    position: 'absolute',
    right: -10, // Adjusted position
    top: '50%',
    transform: [{ translateY: -70 }], // Adjusted for 4 items
    gap: 8, // Reduced gap for 4 items
  },
  sideNumber: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 33,
    alignItems: 'center',
  },
  sideNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  legendDot: {
    width: 24,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#000000',
  },
  markReportCard: {
    marginHorizontal: 4,
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  chartBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: 12,
    marginTop: 40,
    gap: 24,
  },
  gradeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  gradeBarContainer: {
    width: 40,
    height: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  gradeBar: {
    width: '100%',
    borderRadius: 8,
    minHeight: 40,
  },
  gradeScore: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gradeLabel: {
    fontSize: 12,
    color: '#000000',
  },
  gradeWeight: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  noGradeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noGradeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  noGradeSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  successFooter: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  successContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  overallScore: {
    fontSize: 24,
    fontWeight: '500',
    color: '#166534',
  },
  successChartContainer: {
    height: 80,
    overflow: 'hidden',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});