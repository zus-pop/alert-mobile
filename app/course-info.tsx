import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
import { IconSymbol } from '../components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

const CourseInfo = () => {
  const { courseId, enrollmentId } = useLocalSearchParams<{ courseId: string; enrollmentId?: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [studentEnrollment, setStudentEnrollment] = useState<StudentEnrollment | null>(null);
  const [studyProgress, setStudyProgress] = useState<StudyProgress | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<{type: string, score: number, weight: number} | null>(null);
  const { user } = useAuthStore();

  // Helper functions consolidated
  const gradeHelpers = {
    getColor: (score: number) => score >= 8 ? '#4DAF00' : score >= 5 ? '#FFA500' : score > 0 ? '#EF4444' : '#E5E7EB',
    getStatus: (score: number) => score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 5 ? 'Average' : score > 0 ? 'Poor' : 'Not Graded',
    getCardColor: (grade: number) => ['#F3F4F6', '#FEF2F2', '#FEF3F2', '#FFFBEB', '#F0FDF4'][grade === 0 ? 0 : grade >= 8 ? 4 : grade >= 6 ? 3 : grade >= 5 ? 2 : 1],
    getTextColor: (grade: number) => ['#6B7280', '#DC2626', '#C2410C', '#92400E', '#166534'][grade === 0 ? 0 : grade >= 8 ? 4 : grade >= 6 ? 3 : grade >= 5 ? 2 : 1],
    getMessage: (grade: number) => ['No grades recorded yet', 'Work harder to raise your grades!', 'You\'re doing okay. Keep improving!', 'Good job! Keep up the good work!', 'Excellent! Your grades are outstanding!'][grade === 0 ? 0 : grade >= 8 ? 4 : grade >= 6 ? 3 : grade >= 5 ? 2 : 1],
    format: (grade: number) => grade === 0 ? 'N/A' : grade.toFixed(1)
  };

  const statusMap: Record<string, { color: string; icon: string }> = {
    PASSED: { color: '#22C55E', icon: 'checkmark-circle-outline' },
    'NOT PASSED': { color: '#EF4444', icon: 'close-circle-outline' },
    'IN PROGRESS': { color: '#F59E0B', icon: 'time-outline' }
  };

  const attendanceColors = ['#22C55E', '#EF4444', '#9CA3AF'];
  const attendanceLabels = ['Attended', 'Absent', 'Not Yet'];
  
  const getStatusInfo = (status: string) => statusMap[status?.toUpperCase()] || { color: '#6B7280', icon: 'help-circle-outline' };

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
          setStudentEnrollment(studentEnrollmentResponse.data || studentEnrollmentResponse);
        } catch (error) {
          console.error('Error fetching student enrollment details:', error);
        }

        // Fetch attendance records
        try {
          const attendanceResponse = await getStudentAttendances(user._id, userEnrollment._id);
          setAttendances(attendanceResponse);
        } catch (error) {
          console.error('Error fetching attendance records:', error);
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

  // Calculate attendance statistics
  const attendanceStats = (() => {
    if (!attendances?.length) return { totalSessions: 20, presentCount: 0, absentCount: 0, notYetCount: 20, attendanceRate: 0 };
    const counts = attendances.reduce((acc, att) => {
      acc[att.status === 'ATTENDED' ? 'presentCount' : att.status === 'ABSENT' ? 'absentCount' : 'notYetCount']++;
      return acc;
    }, { presentCount: 0, absentCount: 0, notYetCount: 0 });
    return { ...counts, totalSessions: attendances.length, attendanceRate: Math.round((counts.presentCount / attendances.length) * 100) };
  })();

  // Render circular progress indicator with single ring design
  const renderCircularProgress = (percentage: number, size: number = 170) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const strokeWidth = 16;
    
    const total = attendanceStats.totalSessions;
    const percentages = total > 0 ? [
      attendanceStats.presentCount / total,
      attendanceStats.absentCount / total,
      attendanceStats.notYetCount / total
    ] : [0, 0, 0];
    
    const gapAngle = 4;
    const availableAngle = 360 - (3 * gapAngle);
    const angles = percentages.map(p => p * availableAngle);
    
    const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
      const start = startAngle * (Math.PI / 180);
      const end = endAngle * (Math.PI / 180);
      const x1 = centerX + innerRadius * Math.cos(start);
      const y1 = centerY + innerRadius * Math.sin(start);
      const x2 = centerX + outerRadius * Math.cos(start);
      const y2 = centerY + outerRadius * Math.sin(start);
      const x3 = centerX + outerRadius * Math.cos(end);
      const y3 = centerY + outerRadius * Math.sin(end);
      const x4 = centerX + innerRadius * Math.cos(end);
      const y4 = centerY + innerRadius * Math.sin(end);
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`;
    };
    
    let currentAngle = -90;
    const innerRadius = radius - strokeWidth / 2;
    const outerRadius = radius + strokeWidth / 2;
    const counts = [attendanceStats.presentCount, attendanceStats.absentCount, attendanceStats.notYetCount];

    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressWrapper, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} strokeLinecap="round" />
            {angles.map((angle, index) => {
              if (angle === 0) return null;
              const segmentPath = createArcPath(currentAngle, currentAngle + angle, innerRadius, outerRadius);
              const result = <Path key={index} d={segmentPath} fill={attendanceColors[index]} stroke="none" />;
              currentAngle += angle + gapAngle;
              return result;
            })}
          </Svg>
          <View style={styles.progressCenter}>
            <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
          </View>
        </View>
        <View style={styles.sideNumbers}>
          {counts.map((count, i) => (
            <View key={i} style={[styles.sideNumber, { backgroundColor: attendanceColors[i] }]}>
              <Text style={styles.sideNumberText}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderGradeBars = () => {
    if (!studentEnrollment?.grade?.length) {
      return (
        <View style={styles.noGradeContainer}>
          <Ionicons name="school-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noGradeText}>No grades available yet</Text>
          <Text style={styles.noGradeSubtext}>Grades will appear here once they are recorded</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.gradeScrollView}
        contentContainerStyle={styles.gradeScrollContent}
      >
        <View style={styles.gradeContainer}>
          {studentEnrollment.grade.map((grade, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.gradeItem}
              onPress={() => setSelectedGrade(grade)}
              activeOpacity={0.7}
            >
              <View style={styles.gradeBarContainer}>
                <View 
                  style={[
                    styles.gradeBar, 
                    { 
                      height: `${Math.max((grade.score / 10) * 100, 8)}%`,
                      backgroundColor: gradeHelpers.getColor(grade.score)
                    }
                  ]} 
                />
                <Text style={styles.gradeScore}>{grade.score.toFixed(1)}</Text>
              </View>
              <View style={styles.gradeLabelContainer}>
                <Text style={styles.gradeLabel}>
                  {grade.type}
                </Text>
                <Text style={styles.gradeWeight}>
                  ({Math.round(grade.weight * 100)}%)
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderSuccessChart = () => {
    if (!studentEnrollment?.grade?.length) {
      return (
        <View style={styles.successChartContainer}>
          <Text style={styles.noGradeChartText}>No grade data to display</Text>
        </View>
      );
    }

    const grades = studentEnrollment.grade;
    const minChartWidth = 360;
    const itemWidth = 80;
    const dynamicWidth = Math.max(minChartWidth, grades.length * itemWidth);
    const chartHeight = 120, padding = 60;
    const graphWidth = dynamicWidth - (padding * 2);
    const graphHeight = chartHeight - 30;

    const points = grades.map((grade, index) => ({
      x: padding + (index * (graphWidth / Math.max(grades.length - 1, 1))),
      y: chartHeight - 20 - ((grade.score / 10) * graphHeight),
      score: grade.score,
      type: grade.type
    }));

    const linePath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <View style={styles.successChartContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.chartScrollView}
          contentContainerStyle={styles.chartScrollContent}
        >
          <View style={styles.chartWrapper}>
            <Svg width={dynamicWidth} height={chartHeight} viewBox={`0 0 ${dynamicWidth} ${chartHeight}`}>
              <Defs>
                <LinearGradient id="gradeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </LinearGradient>
              </Defs>
              
              {[2, 4, 6, 8].map((score) => (
                <Path
                  key={score}
                  d={`M ${padding} ${chartHeight - 20 - ((score / 10) * graphHeight)} L ${dynamicWidth - padding} ${chartHeight - 20 - ((score / 10) * graphHeight)}`}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}
              
              {linePath && (
                <Path
                  d={linePath}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {points.map((point, index) => (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}
            </Svg>
            
            <View style={[styles.gradeLabelsContainer, { width: dynamicWidth }]}>
              {grades.map((grade, index) => {
                const labelX = padding + (index * (graphWidth / Math.max(grades.length - 1, 1)));
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.gradeLabelItem,
                      { 
                        position: 'absolute',
                        left: labelX - 30,
                        width: 60
                      }
                    ]}
                  >
                    <Text style={styles.gradeChartLabel}>{grade.type}</Text>
                    <Text style={styles.gradeChartScore}>{grade.score}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };
  const renderGradeModal = () => {
    if (!selectedGrade) return null;

    return (
      <Modal
        visible={selectedGrade !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedGrade(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grade Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedGrade(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gradeDetailContainer}>
              <View style={[styles.gradeColorIndicator, { backgroundColor: gradeHelpers.getColor(selectedGrade.score) }]} />
              <View style={styles.gradeDetailInfo}>
                <Text style={styles.gradeDetailType}>{selectedGrade.type}</Text>
                <Text style={styles.gradeDetailScore}>{selectedGrade.score.toFixed(1)}/10</Text>
                <Text style={styles.gradeDetailWeight}>Weight: {Math.round(selectedGrade.weight * 100)}%</Text>
                <Text style={[styles.gradeDetailStatus, { color: gradeHelpers.getColor(selectedGrade.score) }]}>
                  {gradeHelpers.getStatus(selectedGrade.score)}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setSelectedGrade(null)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const tabItems = [
    { name: 'home', title: 'Home', icon: 'house.fill', route: '/(tabs)/home' },
    { name: 'chat', title: 'Chat', icon: 'chat.fill', route: '/(tabs)/chat' },
    { name: 'my-course', title: 'My Course', icon: 'book.fill', route: '/(tabs)/my-course' },
    { name: 'profile', title: 'My Profile', icon: 'person.fill', route: '/(tabs)/profile' }
  ];

  // Render custom bottom tab bar
  const renderBottomTabs = () => (
    <View style={styles.bottomTabContainer}>
      <View style={styles.bottomTabBar}>
        {tabItems.map((tab, index) => (
          <TouchableOpacity key={index} style={styles.tabItem} onPress={() => router.push(tab.route as any)}>
            <IconSymbol size={24} name={tab.icon as any} color={tab.name === 'my-course' ? '#3B82F6' : '#6B7280'} />
            <Text style={[styles.tabLabel, { color: tab.name === 'my-course' ? '#3B82F6' : '#6B7280' }]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLoadingOrError = () => {
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

    return null;
  };

  if (loading || error) return renderLoadingOrError();

  const overallGrade = studentEnrollment?.finalGrade || 
    (studentEnrollment?.grade?.length 
      ? studentEnrollment.grade.reduce((sum, g) => sum + (g.score * g.weight), 0) 
      : 0);

  const courseDetails = [
    { icon: 'book-outline', label: 'Subject', value: course?.subjectId?.subjectName || 'N/A' },
    { icon: 'code-outline', label: 'Course Code', value: course?.subjectId?.subjectCode || 'N/A' },
    { icon: 'calendar-outline', label: 'Semester', value: course?.semesterId?.semesterName || 'N/A' },
    { icon: 'stats-chart-outline', label: 'Attendance', value: `${attendanceStats.presentCount}/${attendanceStats.totalSessions} sessions attended (${attendanceStats.attendanceRate}%)` },
    ...(enrollment ? [{ icon: getStatusInfo(enrollment.status).icon, label: 'Status', value: enrollment.status, color: getStatusInfo(enrollment.status).color }] : [])
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/my-course')}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          <Text style={styles.backButtonText}>My Course</Text>
        </TouchableOpacity>
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
          {attendanceLabels.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: attendanceColors[index] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
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
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitle}>
              <Text style={styles.cardTitle}>Study Progress</Text>
            </View>
          </View>
          {/* Success Footer - Dynamic color based on grade */}
          <View style={[styles.successFooter, { backgroundColor: gradeHelpers.getCardColor(overallGrade) }]}>
            <View style={styles.successContent}>
              <Text style={[styles.successText, { color: gradeHelpers.getTextColor(overallGrade) }]}>
                {gradeHelpers.getMessage(overallGrade)}
              </Text>
              <Text style={[styles.overallScore, { color: gradeHelpers.getTextColor(overallGrade) }]}>
                {gradeHelpers.format(overallGrade)}
              </Text>
            </View>
            {renderSuccessChart()}
          </View>
        </View>

        {/* Course Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <View style={styles.detailsCard}>
            {courseDetails.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Ionicons name={detail.icon as any} size={20} color={detail.color || "#6B7280"} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={[styles.detailValue, { color: detail.color || '#1F2937' }]}>
                    {detail.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Tab Navigation */}
      {renderBottomTabs()}
      
      {/* Grade Detail Modal */}
      {renderGradeModal()}
    </SafeAreaView>
  );
};

export default CourseInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButtonContainer: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 20, // Reduced since we have back button now
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 48,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 40, // Increased spacing
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: screenWidth - 40,
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
    marginTop: 32, // Increased spacing
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
    marginTop: 40, // Increased spacing
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
    paddingVertical: 20, // Reduced padding
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
    paddingBottom: 20, // Reduced padding
    overflow: 'hidden',
  },
  gradeScrollView: {
    marginTop: 30, // Reduced spacing
    marginBottom: 20,
  },
  gradeScrollContent: {
    paddingHorizontal: 12,
    paddingRight: 40,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220,
    gap: 12,
    paddingRight: 20,
  },
  gradeItem: {
    alignItems: 'center',
    gap: 8,
    width: 70,
    marginHorizontal: 4,
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
  gradeLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 12,
    minHeight: 40,
  },
  gradeLabel: {
    fontSize: 11,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  gradeWeight: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
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
    paddingVertical: 20, // Reduced padding
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
    height: 200,
    overflow: 'hidden',
    paddingTop: 10,
  },
  chartScrollView: {
    flex: 1,
  },
  chartScrollContent: {
    paddingHorizontal: 12,
    paddingRight: 40,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingRight: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
    marginTop: 32, // Increased spacing
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
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  bottomTabBar: {
    backgroundColor: '#F5F6FA',
    borderRadius: 24,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  gradeDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  gradeColorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 16,
  },
  gradeDetailInfo: {
    flex: 1,
  },
  gradeDetailType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  gradeDetailScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  gradeDetailWeight: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gradeDetailStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalCloseButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  gradeLabelsContainer: {
    position: 'relative',
    height: 40,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  gradeLabelItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gradeChartLabel: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  gradeChartScore: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  noGradeChartText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 30,
  },
});