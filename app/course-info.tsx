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
import { CourseData, getCourseById } from '../apis/courses.api';
import { Enrollment, getStudentEnrollments } from '../apis/enrollments.api';
import { useAuthStore } from '../stores/useAuthStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const uiDesign = require("../assets/images/uiDesign.png");
const uxDesign = require("../assets/images/uxDesign.png");
const webDesign = require("../assets/images/webDesign.png");
const wireframe = require("../assets/images/wireframe.png");

interface CourseInfoProps {}

const CourseInfo: React.FC<CourseInfoProps> = () => {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
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

        // Fetch course details
        const courseResponse = await getCourseById(courseId);
        console.log('Course API Response:', courseResponse); // Debug log
        
        // Handle different response structures
        const courseData = courseResponse.data || courseResponse;
        console.log('Course Data:', courseData); // Debug log
        
        if (!courseData) {
          setError('Course data not found.');
          return;
        }
        
        setCourse(courseData);

        // Check if user is enrolled in this course
        if (user?._id) {
          try {
            const enrollmentsResponse = await getStudentEnrollments(user._id);
            const userEnrollment = enrollmentsResponse.data.find(
              (enr) => enr.courseId?._id === courseId
            );
            setEnrollment(userEnrollment || null);
          } catch (enrollmentError) {
            console.error('Error fetching enrollment:', enrollmentError);
            setEnrollment(null);
          }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCourseImage = () => {
    const images = [uiDesign, uxDesign, webDesign, wireframe];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  const calculateOverallScore = (grades: Enrollment['grade']) => {
    if (!grades || grades.length === 0) return 0;
    
    const totalWeightedScore = grades.reduce((sum, grade) => {
      return sum + (grade.score * grade.weight);
    }, 0);
    
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FF9800';
    if (score >= 4) return '#FFC107';
    return '#F44336';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return { bg: '#E8F5E8', text: '#4CAF50' };
      case 'IN PROGRESS':
        return { bg: '#FFF3E0', text: '#FF9800' };
      case 'NOT PASSED':
        return { bg: '#FFEBEE', text: '#F44336' };
      default:
        return { bg: '#F5F5F5', text: '#666' };
    }
  };

  const renderScoreCircle = (score: number, color: string) => {
    const percentage = Math.min(score / 10, 1);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={[styles.progressBackground, { borderColor: '#E0E0E0' }]} />
          <View
            style={[
              styles.progressForeground,
              {
                borderColor: color,
                transform: [{ rotate: `${percentage * 360}deg` }]
              }
            ]}
          />
          <View style={styles.progressInner}>
            <Text style={styles.progressText}>{score.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderGradeCard = (grade: Enrollment['grade'][0], index: number) => {
    const color = getScoreColor(grade.score);
    
    return (
      <View style={styles.gradeCard}>
        <View style={styles.gradeHeader}>
          <Text style={styles.gradeType}>{grade.type}</Text>
          <View style={[styles.scoreContainer, { backgroundColor: color + '20' }]}>
            <Text style={[styles.scoreText, { color }]}>{grade.score}</Text>
          </View>
        </View>
        <View style={styles.gradeInfo}>
          <Text style={styles.weightText}>Weight: {grade.weight}%</Text>
          <Text style={styles.contributionText}>
            Contribution: {((grade.score * grade.weight) / 100).toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B3A67" />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error || 'Course not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isEnrolled = enrollment !== null;
  const overallScore = isEnrolled ? calculateOverallScore(enrollment.grade) : 0;
  const statusColors = isEnrolled ? getStatusColor(enrollment.status) : { bg: '#F5F5F5', text: '#666' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2B3A67" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Information</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Image & Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={getCourseImage()}
            style={styles.courseImage}
            resizeMode="cover"
          />
          
          <View style={styles.heroOverlay}>
            <Text style={styles.courseTitle}>
              {course.subjectId?.subjectName || 'Unknown Course'}
            </Text>
            <Text style={styles.courseCode}>
              {course.subjectId?.subjectCode}
            </Text>
            {isEnrolled && (
              <View style={styles.enrolledIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.enrolledText}>Enrolled</Text>
              </View>
            )}
          </View>
        </View>

        {/* Course Info Cards */}
        <View style={styles.infoSection}>
          {/* Enrollment Status Card (if enrolled) */}
          {isEnrolled && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Your Progress</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {enrollment.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Overall Score</Text>
                  <Text style={styles.progressValue}>{overallScore.toFixed(1)}/10</Text>
                </View>
                {renderScoreCircle(overallScore, getScoreColor(overallScore))}
              </View>
            </View>
          )}

          {/* Course Details Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Course Details</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="book-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Subject Code</Text>
                <Text style={styles.detailValue}>
                  {course.subjectId?.subjectCode || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Semester</Text>
                <Text style={styles.detailValue}>
                  {course.semesterId?.semesterName || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {formatDate(course.semesterId?.startDate)} - {formatDate(course.semesterId?.endDate)}
                </Text>
              </View>
            </View>
            
            {isEnrolled && (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Enrolled Date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(enrollment.enrollmentDate)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Grades Card (if enrolled) */}
          {isEnrolled && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Grade Breakdown</Text>
              {enrollment.grade && enrollment.grade.length > 0 ? (
                <View style={styles.gradesContainer}>
                  {enrollment.grade.map((grade, index) => (
                    <View key={index}>
                      {renderGradeCard(grade, index)}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noGradesContainer}>
                  <Ionicons name="document-outline" size={48} color="#ccc" />
                  <Text style={styles.noGradesText}>No grades available yet</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isEnrolled ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  router.push({
                    pathname: "/course-info",
                    params: { enrollmentId: enrollment._id }
                  });
                }}
              >
                <Ionicons name="book-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>View Full Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // Navigate to course materials
                }}
              >
                <Ionicons name="document-text-outline" size={20} color="#2B3A67" />
                <Text style={styles.secondaryButtonText}>Materials</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  // Handle enrollment logic
                  // You can add enrollment API call here
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Enroll Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // Navigate to course preview
                }}
              >
                <Ionicons name="eye-outline" size={20} color="#2B3A67" />
                <Text style={styles.secondaryButtonText}>Preview</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    position: 'relative',
    marginBottom: 20,
  },
  courseImage: {
    width: '100%',
    height: screenHeight * 0.25,
    backgroundColor: '#f0f0f0',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 8,
  },
  enrolledIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  enrolledText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#E0E0E0',
  },
  progressForeground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B3A67',
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
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#2B3A67',
    fontWeight: '500',
  },
  gradesContainer: {
    gap: 12,
  },
  gradeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2B3A67',
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B3A67',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gradeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weightText: {
    fontSize: 14,
    color: '#666',
  },
  contributionText: {
    fontSize: 14,
    color: '#666',
  },
  noGradesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noGradesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2B3A67',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2B3A67',
  },
  secondaryButtonText: {
    color: '#2B3A67',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2B3A67',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
