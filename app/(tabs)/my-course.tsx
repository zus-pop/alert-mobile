import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Enrollment, getStudentEnrollments } from '../../apis/enrollments.api';
import { Semester, getSemesters } from '../../apis/semesters.api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSelectedCourseStore } from '../../stores/useSelectedCourseStore';

const MyCourse: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { selectedCourseId, clearSelectedCourse } = useSelectedCourseStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchSemesters = async () => {
    try {
      setSemesterLoading(true);
      const response = await getSemesters();
      setSemesters(response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setSemesterLoading(false);
    }
  };

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
      setAllEnrollments(validEnrollments);
      setEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollmentsBySemester = (semesterId: string) => {
    if (semesterId === 'all') {
      setEnrollments(allEnrollments);
    } else {
      const filtered = allEnrollments.filter(enrollment => 
        enrollment.courseId.semesterId._id === semesterId
      );
      setEnrollments(filtered);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchSemesters();
  }, []);

  useEffect(() => {
    filterEnrollmentsBySemester(selectedSemester);
  }, [selectedSemester, allEnrollments]);

  // Clear selected course when component unmounts
  useEffect(() => {
    return () => {
      clearSelectedCourse();
    };
  }, [clearSelectedCourse]);

  const handleRefresh = async () => {
    try {
      if (!user?._id) {
        setError('User not found. Please login again.');
        return;
      }

      const response = await getStudentEnrollments(user._id);
      // Filter out enrollments with null subjectId
      const validEnrollments = response.data.filter(enrollment =>
        enrollment.courseId.subjectId !== null
      );
      setAllEnrollments(validEnrollments);
      setEnrollments(validEnrollments);
      setError(null);
    } catch (error) {
      console.error('Error refreshing enrollments:', error);
      setError('Failed to load courses. Please try again.');
    }
  };

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

  const getDisplayGrade = (enrollment: Enrollment) => {
    if (enrollment.finalGrade !== undefined && enrollment.finalGrade !== null) {
      return enrollment.finalGrade;
    }
    return null;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#999'; // Gray for "Not yet"
    if (score >= 8) return '#4CAF50'; // Green for excellent
    if (score >= 6.5) return '#FF9800'; // Orange for good
    if (score >= 5) return '#2196F3'; // Blue for average
    return '#FF6B35'; // Red for poor
  };

  const renderScoreCircle = (score: number | null, color: string) => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={[styles.progressBackground, { borderColor: '#E0E0E0' }]} />
          {score !== null && (
            <View
              style={[
                styles.progressForeground,
                {
                  borderColor: color,
                  transform: [{ rotate: `${(score / 10) * 360}deg` }]
                }
              ]}
            />
          )}
          <View style={styles.progressInner}>
            <Text style={[
              styles.progressText,
              score === null && styles.progressTextNotYet
            ]}>
              {score !== null ? score.toFixed(1) : 'Not yet'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSemesterChip = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedSemester === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.semesterChip,
          isSelected && styles.selectedSemesterChip
        ]}
        onPress={() => setSelectedSemester(item.id)}
      >
        <Text style={[
          styles.semesterChipText,
          isSelected && styles.selectedSemesterChipText
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Prepare semester data for FlatList (all semesters from API, sorted by date)
  const semesterData = semesters
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map(semester => ({
      id: semester._id,
      name: semester.semesterName
    }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
      </View>

      {/* Semester Filter */}
      {semesterData.length > 0 && (
        <View style={styles.filterContainer}>
          {semesterLoading ? (
            <View style={styles.semesterLoadingContainer}>
              <ActivityIndicator size="small" color="#2B3A67" />
              <Text style={styles.semesterLoadingText}>Loading semesters...</Text>
            </View>
          ) : (
            <FlatList
              data={semesterData}
              renderItem={renderSemesterChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.semesterListContainer}
              style={styles.semesterList}
            />
          )}
        </View>
      )}

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
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor="#2B3A67"
            />
          }
        >
          {enrollments.length === 0 ? (
            <View style={styles.emptyContainer} >
              <Image
                source={require('../../assets/images/coursenotfound.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>
                {selectedSemester === 'all' ? 'No Courses' : 'No Courses Found'}
              </Text>
              <Text style={styles.emptyDescription}>
                {selectedSemester === 'all' 
                  ? 'Looks like you have not enrolled for any course yet'
                  : 'No courses found for the selected semester'
                }
              </Text>
              {selectedSemester === 'all' && (
                <TouchableOpacity style={styles.exploreCourseButton}>
                  <Text style={styles.exploreCourseText}>Explore Courses</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            enrollments.map((enrollment, index) => {
              const displayGrade = getDisplayGrade(enrollment);
              const isSelected = enrollment._id === selectedCourseId;
              return (
                <TouchableOpacity
                  key={enrollment._id}
                  style={[
                    styles.courseCard,
                    isSelected && styles.selectedCourseCard
                  ]}
                  activeOpacity={0.9}
                  onPress={() => {
                    // Navigate to course-info screen with courseId and enrollmentId
                    router.push({
                      pathname: "/course-info",
                      params: {
                        courseId: enrollment.courseId?._id,
                        enrollmentId: enrollment._id
                      }
                    });
                  }}
                >
                  <View style={styles.courseContent}
                  >
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


                    </View>

                    <View style={styles.progressSection}>
                      {renderScoreCircle(
                        displayGrade,
                        getScoreColor(displayGrade)
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.overviewButton}
                    onPress={() => {
                      // Navigate to course-info screen with courseId and enrollmentId
                      router.push({
                        pathname: "/course-info",
                        params: {
                          courseId: enrollment.courseId?._id,
                          enrollmentId: enrollment._id
                        }
                      });
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

  // Semester Filter Styles
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B3A67',
    marginBottom: 12,
  },
  semesterLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  semesterLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  semesterList: {
    flexGrow: 0,
  },
  semesterListContainer: {
    paddingRight: 20,
  },
  semesterChip: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSemesterChip: {
    backgroundColor: '#2B3A67',
    borderColor: '#2B3A67',
  },
  semesterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2B3A67',
  },
  selectedSemesterChipText: {
    color: '#fff',
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
    textAlign: 'center',
  },
  progressTextNotYet: {
    fontSize: 8,
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