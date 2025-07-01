import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Enrollment, EnrollmentStatusGroup, getStudentEnrollments } from '../../apis/enrollments.api';
import LogoutModal from '../../components/LogoutModal';
import { useNotification } from "../../contexts/notification-provider";
import { useAuthStore } from '../../stores/useAuthStore';
interface StatItem {
  label: string;
  count: number;
  color: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStatusGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { deletePushToken } = useNotification();
  const fetchEnrollments = async () => {
    if (!user?._id) return;

    try {
      const response = await getStudentEnrollments(user._id);
      setEnrollments(response.data);
      setEnrollmentStats(response.groupByEnrollmentStatus || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnrollments();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await deletePushToken();
      logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const getStats = (): StatItem[] => {
    // Chỉ sử dụng dữ liệu từ API, nếu không có thì hiển thị N/A
    if (enrollmentStats.length > 0) {
      const totalCourses = enrollmentStats.reduce((sum, stat) => sum + stat.count, 0);
      const passedCourses = enrollmentStats.find(stat => stat.status === 'PASSED')?.count || 0;
      const failedCourses = enrollmentStats.find(stat => stat.status === 'NOT PASSED')?.count || 0;

      return [
        { label: 'Course', count: totalCourses, color: '#3B82F6' },
        { label: 'Pass', count: passedCourses, color: '#10B981' },
        { label: 'Fail', count: failedCourses, color: '#EF4444' },
      ];
    }

    // Hiển thị N/A khi không có dữ liệu từ API
    return [
      { label: 'Course', count: 0, color: '#3B82F6' },
      { label: 'Pass', count: 0, color: '#10B981' },
      { label: 'Fail', count: 0, color: '#EF4444' },
    ];
  };

  const getInProgressCourses = () => {
    return enrollments.filter(enrollment => enrollment.status === 'IN PROGRESS');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Banner */}
      <View className="relative" style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/uxDesign.png')}
          className="w-full"
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Profile Info */}
      <View className="px-6 relative z-10" style={styles.profileContainer}>
        <View className="flex-row items-end justify-between" style={styles.headerContainer}>
          {/* Avatar */}
          <View className="bg-white rounded-full p-1 shadow-lg" style={styles.avatarContainer}>
            <Image
              source={
                user?.image
                  ? { uri: user.image }
                  : require('../../assets/images/avatar.png')
              }
              className="rounded-full"
              style={styles.avatar}
            />
          </View>

          {/* Settings Icon */}
          <TouchableOpacity
            onPress={handleLogout}
            className=" rounded-full p-3 shadow-lg"
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.studentCode}>
            {user?.studentCode}
          </Text>
          <Text style={styles.userDescription}>
            Pick Your Next Challenge Pick Your Next Pick Your Next Challenge
          </Text>
        </View>

        {/* Stats Bar */}
        <View className="flex-row bg-gray-50 rounded-xl" style={styles.statsContainer}>
          {getStats().map((stat, index) => (
            <View key={stat.label} className="flex-1">
              <View className="items-center">
                <Text
                  className="text-2xl font-bold"
                  style={{ color: stat.color }}
                >
                  {enrollmentStats.length > 0 ? stat.count : 'N/A'}
                </Text>
                <Text className="text-sm text-gray-600">{stat.label}</Text>
              </View>
              {index < getStats().length - 1 && (
                <View className="absolute right-0 top-0 bottom-0 w-px bg-gray-300" />
              )}
            </View>
          ))}
        </View>

        {/* Latest Course Section */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Latest Course</Text>
            <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
              <Ionicons name="filter-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Course List */}
          {getInProgressCourses().length > 0 ? (
            getInProgressCourses().map((enrollment) => (
              <View key={enrollment._id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-start">
                  <Image
                    source={require('../../assets/images/uiDesign.png')}
                    className="rounded-lg"
                    style={styles.courseImage}
                  />
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-base">
                      {enrollment.courseId.subjectId?.subjectName || 'Unknown Subject'}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {enrollment.courseId.subjectId?.subjectCode}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View className="bg-blue-100 px-2 py-1 rounded-full">
                        <Text className="text-blue-600 text-xs font-medium">
                          {enrollment.status}
                        </Text>
                      </View>
                      {enrollment.grade.length > 0 && (
                        <View className="ml-2 bg-gray-100 px-2 py-1 rounded-full">
                          <Text className="text-gray-600 text-xs">
                            Grade: {enrollment.grade[enrollment.grade.length - 1]?.score || 'N/A'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <Image
                source={require('../../assets/images/coursenotfound.png')}
                className="opacity-50"
                style={styles.emptyStateImage}
              />
              <Text className="text-gray-500 mt-4">No courses in progress</Text>
            </View>
          )}
        </View>
      </View>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        loading={loggingOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    minHeight: 150,
    maxHeight: 200,
    height: 180,
  },
  bannerImage: {
    minHeight: 120,
    maxHeight: 270,
    height: 270,
  },
  profileContainer: {
    marginTop: -40,
  },
  headerContainer: {
    marginBottom: 16,
  },
  avatarContainer: {
    marginTop: 90,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  settingsButton: {
    alignSelf: 'flex-end',
  },
  userInfoContainer: {
    marginTop: -10,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  studentCode: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 4,
  },
  userDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  courseImage: {
    width: 50,
    height: 55,
    borderRadius: 8,
    minHeight: 50,
    maxHeight: 55,
    marginRight: 12,
  },
  emptyStateImage: {
    width: 96,
    height: 96,
    minHeight: 80,
    maxHeight: 120,
  },
});