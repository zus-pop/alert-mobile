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
import { setUser as fetchUserFromAPI } from '../../apis/auth.api';
import { Curriculum, getCurriculumById } from '../../apis/curriculums.api';
import { useAuthStore } from '../../stores/useAuthStore';

const CurriculumScreen: React.FC = () => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuthStore();

  const fetchUserCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug user data
      console.log('=== CURRICULUM DEBUG ===');
      console.log('Current user data:', user);
      console.log('User curriculumId:', user?.curriculumId);
      console.log('========================');

      if (!user?.curriculumId) {
        console.log('No curriculumId found for user');
        setError('No curriculum assigned to this user.');
        setCurriculum(null);
        return;
      }

      console.log('Fetching curriculum with ID:', user.curriculumId);
      const response = await getCurriculumById(user.curriculumId);
      console.log('Curriculum API response:', response);
      
      // Handle different response structures
      const curriculumData = response.data || response;
      console.log('Curriculum data to set:', curriculumData);
      setCurriculum(curriculumData);
      console.log('Curriculum state updated successfully');
    } catch (error) {
      console.error('Error fetching user curriculum:', error);
      setError('Failed to load curriculum. Please try again.');
      setCurriculum(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data from API...');
      const updatedUser = await fetchUserFromAPI();
      console.log('Updated user data:', updatedUser);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // First refresh user data to get latest curriculumId
      const updatedUser = await refreshUserData();
      
      if (!updatedUser?.curriculumId) {
        setError('No curriculum assigned to this user.');
        setCurriculum(null);
        return;
      }

      const response = await getCurriculumById(updatedUser.curriculumId);
      const curriculumData = response.data || response;
      setCurriculum(curriculumData);
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

  const renderSubjectItem = ({ item }: { item: any }) => (
    <View style={styles.subjectItem}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectMainInfo}>
          {item.subjectCode && (
            <Text style={styles.subjectCode}>{item.subjectCode}</Text>
          )}
          <Text style={styles.subjectName}>
            {item.subjectName || 'Untitled Subject'}
          </Text>
        </View>
        <View style={styles.subjectMetaInfo}>
          <View style={styles.semesterBadge}>
            <Text style={styles.semesterText}>Semester {item.semesterNumber || 1}</Text>
          </View>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>{item.credits || 3} credits</Text>
          </View>
        </View>
      </View>
      {item.description && (
        <Text style={styles.subjectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );

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
            <TouchableOpacity style={[styles.retryButton, styles.refreshButton]} onPress={refreshUserData}>
              <Text style={styles.retryText}>Refresh User Data</Text>
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
          <TouchableOpacity style={[styles.retryButton, styles.refreshButton, {marginTop: 20}]} onPress={refreshUserData}>
            <Text style={styles.retryText}>Refresh User Data</Text>
          </TouchableOpacity>
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
              {curriculum.curriculumCode && (
                <Text style={styles.curriculumCode}>{curriculum.curriculumCode}</Text>
              )}
              <Text style={styles.curriculumName}>{curriculum.curriculumName || 'Untitled Curriculum'}</Text>
            </View>
            <View style={styles.curriculumStats}>
              <View style={styles.subjectCount}>
                <Text style={styles.subjectCountNumber}>{curriculum.subjects?.length || 0}</Text>
                <Text style={styles.subjectCountLabel}>Subjects</Text>
              </View>
            </View>
          </View>
          
          {curriculum.description && (
            <Text style={styles.curriculumDescription}>
              {curriculum.description}
            </Text>
          )}

          {curriculum.subjects && curriculum.subjects.length > 0 && (
            <View style={styles.subjectsContainer}>
              <FlatList
                data={curriculum.subjects.sort((a, b) => (a.semesterNumber || 1) - (b.semesterNumber || 1))}
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
  subjectDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default CurriculumScreen;
