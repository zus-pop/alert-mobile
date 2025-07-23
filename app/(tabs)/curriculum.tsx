import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Combo, getComboById } from '../../apis/combos.api';
import { Curriculum, getCurriculumById } from '../../apis/curriculums.api';
import { useAuthStore } from '../../stores/useAuthStore';

const CurriculumScreen: React.FC = () => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchUserCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("user", user)
      if (!user?.curriculumId) {
        setError('No curriculum assigned to this user.');
        setCurriculum(null);
        return;
      }

      // Fetch curriculum by ID and handle API response
      const curriculumData = await getCurriculumById(user.curriculumId, user._id);
      setCurriculum(curriculumData);
      if (curriculumData.comboId) {
        try {
          const comboData = await getComboById(curriculumData.comboId);
          setCombo(comboData);
        } catch (err) {
          setCombo(null);
        }
      } else {
        setCombo(null);
      }
    } catch (error) {
      console.error('Error fetching user curriculum:', error);
      setError('Failed to load curriculum. Please try again.');
      setCurriculum(null);
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async () => {
    try {
      setRefreshing(true);


      if (!user?.curriculumId) {
        setError('No curriculum assigned to this user.');
        setCurriculum(null);
        return;
      }

      const curriculumData = await getCurriculumById(user.curriculumId, user._id);
      setCurriculum(curriculumData);
      if (curriculumData.comboId) {
        try {
          const comboData = await getComboById(curriculumData.comboId);
          setCombo(comboData);
        } catch (err) {
          setCombo(null);
        }
      } else {
        setCombo(null);
      }
      setError(null);
    } catch (error) {
      console.error('Error refreshing curriculum:', error);
      setError('Failed to refresh curriculum. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - curriculum changed:', curriculum);
    fetchUserCurriculum();
  }, [user?.curriculumId]);

  const renderSubjectItem = ({ item }: { item: any }) => {
    // studentData có thể là mảng hoặc object, tùy vào cấu trúc API
    // Giả sử là mảng, lấy studentData đầu tiên
    const studentData = Array.isArray(item.studentData) ? item.studentData[0] : item.studentData;
    // Determine status style
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'PASSED':
          return [styles.statusBadge, styles.statusPassed];
        case 'IN PROGRESS':
          return [styles.statusBadge, styles.statusInProgress];
        case 'NOT PASSED':
          return [styles.statusBadge, styles.statusNotPassed];
        default:
          return [styles.statusBadge];
      }
    };
    const getStatusTextStyle = (status: string) => {
      switch (status) {
        case 'PASSED':
          return [styles.statusText, styles.statusPassedText];
        case 'IN PROGRESS':
          return [styles.statusText, styles.statusInProgressText];
        case 'NOT PASSED':
          return [styles.statusText, styles.statusNotPassedText];
        default:
          return [styles.statusText];
      }
    };

    // Nếu có enrollmentId thì cho phép chuyển trang
    const handlePressSubject = () => {
      if (studentData?.enrollmentId) {
        // Sử dụng expo-router
        router.push({
          pathname: '/course-info',
          params: {
            enrollmentId: studentData.enrollmentId,
          },
        });
      }
    };

    const Wrapper = studentData?.enrollmentId ? TouchableOpacity : View;

    return (
      <Wrapper
        style={styles.subjectItem}
        onPress={studentData?.enrollmentId ? handlePressSubject : undefined}
        activeOpacity={0.7}
      >
        <View style={styles.subjectHeader}>
          <View style={styles.subjectMainInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {item.subjectCode && (
                <Text style={styles.subjectCode}>{item.subjectCode}</Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                {item.credit !== undefined && (
                  <View style={styles.creditsBadge}>
                    <Text style={styles.creditsText}>{item.credit} credits</Text>
                  </View>
                )}
                {item.semesterNumber !== undefined && (
                  <View style={styles.semesterBadge}>
                    <Text style={styles.semesterText}>Semester {item.semesterNumber}</Text>
                  </View>
                )}

              </View>
            </View>
            <Text style={styles.subjectName}>
              {item.subjectName || 'Untitled Subject'}
            </Text>

            {(studentData?.status || (studentData?.finalGrade !== undefined && studentData?.finalGrade !== null)) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                {studentData?.status && (
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Status: </Text>
                    <View style={getStatusStyle(studentData.status)}>
                      <Text style={getStatusTextStyle(studentData.status)}>
                        {studentData.status}
                      </Text>
                    </View>
                  </View>
                )}
                {(studentData?.finalGrade !== undefined && studentData?.finalGrade !== null) && (
                  <View style={styles.finalGradeBadge}>
                    <Text style={styles.finalGradeText}>Final Grade: {studentData.finalGrade.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            )}

          </View>
          {/* ...existing code... */}
        </View>
      </Wrapper>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Curriculum</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B3A67" />
          <Text style={styles.loadingText}>Loading curriculum...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Curriculum</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserCurriculum}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!curriculum) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Curriculum</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Curriculum Assigned</Text>
          <Text style={styles.emptyDescription}>
            You don't have a curriculum assigned yet. Please contact your administrator.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Curriculum</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2B3A67"
          />
        }
      >
        <View style={styles.curriculumCard}>
          <View style={styles.curriculumHeader}>
            <View style={styles.curriculumInfo}>
              <Text style={styles.curriculumName}>{curriculum.curriculumName || 'Untitled Curriculum'}</Text>
              {combo && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.curriculumCode}>Combo: {combo.comboCode} - {combo.comboName}</Text>
                  {combo.description && (
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Description: {combo.description}</Text>
                  )}
                </View>
              )}
            </View>
            <View style={styles.curriculumStats}>
              <View style={styles.subjectCount}>
                <Text style={styles.subjectCountNumber}>{curriculum.subjects?.length || 0}</Text>
                <Text style={styles.subjectCountLabel}>Subjects</Text>
              </View>
            </View>
          </View>

          {curriculum.subjects && curriculum.subjects.length > 0 && (
            <View style={styles.subjectsContainer}>
              <Text style={styles.subjectsTitle}>Subjects</Text>
              <FlatList
                data={[...curriculum.subjects].sort((a, b) => (a.semesterNumber || -1) - (b.semesterNumber || -1))}
                renderItem={renderSubjectItem}
                keyExtractor={(subject, index) => subject._id || `subject-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: '#2B3A67',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
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
  },
  curriculumCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  curriculumInfo: {
    flex: 1,
  },
  curriculumCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B3A67',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  curriculumName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B3A67',
    lineHeight: 24,
  },
  curriculumStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  finalGradeBadge: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  finalGradeText: {
    color: '#0097A7',
    fontWeight: '700',
    fontSize: 12,
  },
  subjectCount: {
    alignItems: 'center',
  },
  subjectCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B3A67',
  },
  subjectCountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  curriculumDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  subjectsContainer: {
    marginTop: 8,
  },
  subjectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B3A67',
    marginBottom: 12,
  },
  subjectItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectMainInfo: {
    flex: 1,
  },
  subjectCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B3A67',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
  },
  subjectMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  semesterBadge: {
    backgroundColor: '#E0F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  semesterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E88E5',
  },
  creditsBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditsText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FF9800',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
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
  subjectDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default CurriculumScreen;
