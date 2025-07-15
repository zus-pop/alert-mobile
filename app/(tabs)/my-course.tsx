import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Enrollment, getStudentEnrollments } from '../../apis/enrollments.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSelectedCourseStore } from '../../stores/useSelectedCourseStore';

const MyCourse: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { selectedCourseId, clearSelectedCourse } = useSelectedCourseStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?._id) {
        setError('User not found. Please login again.');
        return;
      }

      const response = await getStudentEnrollments(user._id);
      console.log('Fetched enrollments:', response.data);
      // Filter out enrollments with null subjectId
      const validEnrollments = response.data.filter(enrollment =>
        enrollment.courseId.subjectId !== null
      );
      setEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Clear selected course when component unmounts
  useEffect(() => {
    return () => {
      clearSelectedCourse();
    };
  }, [clearSelectedCourse]);

  // Scroll to selected course when component mounts
  useEffect(() => {
    if (selectedCourseId && enrollments.length > 0) {
      const selectedIndex = enrollments.findIndex(enrollment => enrollment._id === selectedCourseId);
      if (selectedIndex !== -1) {
        // Add a small delay to ensure the component is fully rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * 200, // Approximate height of each course card
            animated: true,
          });
        }, 500);
      }
    }
  }, [selectedCourseId, enrollments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  const calculateOverallScore = (grades: Enrollment['grade']) => {
    if (!grades || grades.length === 0) return 0;

    const totalScore = grades.reduce((sum, grade) => {
      return sum + (grade.score * grade.weight);
    }, 0);

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50'; // Green for excellent
    if (score >= 6.5) return '#FF9800'; // Orange for good
    if (score >= 5) return '#2196F3'; // Blue for average
    return '#FF6B35'; // Red for poor
  };

  const renderScoreCircle = (score: number, color: string) => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={[styles.progressBackground, { borderColor: '#E0E0E0' }]} />
          <View
            style={[
              styles.progressForeground,
              {
                borderColor: color,
                transform: [{ rotate: `${(score / 10) * 360}deg` }]
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B3A67" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEnrollments}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Course List */
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {enrollments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../assets/images/coursenotfound.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No Courses</Text>
              <Text style={styles.emptyDescription}>
                Looks like you have not enrolled for any course yet
              </Text>
              <TouchableOpacity style={styles.exploreCourseButton}>
                <Text style={styles.exploreCourseText}>Explore Courses</Text>
              </TouchableOpacity>
            </View>
          ) : (
            enrollments.map((enrollment, index) => {
              const overallScore = calculateOverallScore(enrollment.grade);
              const isSelected = enrollment._id === selectedCourseId;
              return (
                <TouchableOpacity
                  key={enrollment._id}
                  style={[
                    styles.courseCard,
                    isSelected && styles.selectedCourseCard
                  ]}
                  activeOpacity={0.9}
                  onPress={clearSelectedCourse}
                >
                  <View style={styles.courseContent}>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle}>
                        {enrollment.courseId.subjectId?.subjectCode} - {enrollment.courseId.subjectId?.subjectName}
                      </Text>
                      <Text style={styles.courseDetail}>
                        Semester: {enrollment.courseId.semesterId.semesterName}
                      </Text>
                      <Text style={styles.courseDetail}>
                        Start date: {formatDate(enrollment.courseId.semesterId.startDate)}
                      </Text>
                      <Text style={styles.courseDetail}>
                        End date: {formatDate(enrollment.courseId.semesterId.endDate)}
                      </Text>

                      <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Status: </Text>
                        <View style={[
                          styles.statusBadge,
                          enrollment.status === 'PASSED' && styles.statusPassed,
                          enrollment.status === 'IN PROGRESS' && styles.statusInProgress,
                          enrollment.status === 'NOT PASSED' && styles.statusNotPassed,
                        ]}>
                          <Text style={[
                            styles.statusText,
                            enrollment.status === 'PASSED' && styles.statusPassedText,
                            enrollment.status === 'IN PROGRESS' && styles.statusInProgressText,
                            enrollment.status === 'NOT PASSED' && styles.statusNotPassedText,
                          ]}>
                            {enrollment.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.sessionInfo}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.sessionText}>
                          Enrolled: {formatDate(enrollment.enrollmentDate)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      {renderScoreCircle(
                        overallScore,
                        getScoreColor(overallScore)
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.overviewButton}
                    onPress={() => {
                      // Clear selected course when user interacts with the course
                      clearSelectedCourse();
                    }}
                  >
                    <Text style={styles.overviewText}>View Courses</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyCourse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B3A67',
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
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2B3A67',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 250,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B3A67',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreCourseButton: {
    backgroundColor: '#2B3A67',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreCourseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 120, // Add space for bottom tabs
  },

  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCourseCard: {
    borderWidth: 2,
    borderColor: '#2B3A67',
    backgroundColor: '#F8F9FF',
  },
  courseContent: {
    flexDirection: 'row',
    padding: 16,
  },
  courseInfo: {
    flex: 1,
    paddingRight: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B3A67',
    marginBottom: 8,
    lineHeight: 22,
  },
  courseDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 50,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#E0E0E0',
  },
  progressForeground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  overviewButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  overviewText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPassed: {
    backgroundColor: '#E8F5E8',
  },
  statusPassedText: {
    color: '#4CAF50',
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusInProgressText: {
    color: '#FF9800',
  },
  statusNotPassed: {
    backgroundColor: '#FFEBEE',
  },
  statusNotPassedText: {
    color: '#F44336',
  },
}); 