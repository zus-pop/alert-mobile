import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { markNotificationAsRead } from "../apis/notifications.api";
import myAxios from "../utils/my-axios";

interface NotificationDetail {
    _id: string;
    enrollmentId: {
        _id: string;
        courseId: {
            _id: string;
            subjectId: {
                _id: string;
                subjectCode: string;
                subjectName: string;
            };
            semesterId: {
                _id: string;
                semesterName: string;
                startDate: string;
                endDate: string;
            };
        };
        studentId: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            image: string;
        };
        grade: {
            type: string;
            weight: number;
            score: number;
        }[];
        status: string;
        enrollmentDate: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    title: string;
    content: string;
    status: string;
    riskLevel: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    supervisorResponse?: {
        response: string;
        plan: string;
        _id: string;
        createdAt: string;
        updatedAt: string;
    };
}

const NotificationDetailScreen: React.FC = () => {
    const { notificationId } = useLocalSearchParams<{ notificationId: string }>();
    const [notification, setNotification] = useState<NotificationDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (notificationId) {
            console.log('Fetching notification detail for ID:', notificationId);
            fetchNotificationDetail();
        }
    }, [notificationId]);

    const markAsRead = async (notificationData: NotificationDetail) => {
        try {
            const requestData = {
                isRead: "true"
            };

            await markNotificationAsRead(notificationId!, requestData);

            console.log('Notification marked as read successfully');
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const fetchNotificationDetail = async () => {
        try {
            setLoading(true);
            console.log('Calling API with URL:', `alerts/${notificationId}`);
            const response = await myAxios.get(`alerts/${notificationId}`);
            console.log('API Response:', response.data);
            console.log('Grade data:', response.data?.enrollmentId?.grade);

            // Try different response structures
            if (response.data) {
                setNotification(response.data);

                // Mark as read if it's not already read
                if (!response.data.isRead) {
                    await markAsRead(response.data);
                }
            } else {
                console.log('No data found in response');
            }
        }
        catch (error: any) {
            console.error('Error fetching notification detail:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESPONDED':
                return '#4CAF50';
            case 'PENDING':
                return '#FF9800';
            case 'RESOLVED':
                return '#2196F3';
            default:
                return '#757575';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESPONDED':
                return 'checkmark-circle';
            case 'PENDING':
                return 'time';
            case 'RESOLVED':
                return 'checkmark-done-circle';
            default:
                return 'help-circle';
        }
    };

    const calculateOverallGrade = (grades: { type: string; weight: number; score: number; }[]) => {
        if (!grades || grades.length === 0) return 0;

        const validGrades = grades.filter(grade => grade.score != null && grade.weight != null);
        if (validGrades.length === 0) return 0;

        const totalWeightedScore = validGrades.reduce((sum, grade) => {
            return sum + (grade.score * grade.weight);
        }, 0);

        const totalWeight = validGrades.reduce((sum, grade) => sum + grade.weight, 0);

        return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    };

    const getGradeColor = (score: number) => {
        if (score >= 8.5) return '#4CAF50'; // Green for excellent
        if (score >= 7.0) return '#FF9800'; // Orange for good
        if (score >= 5.5) return '#FFC107'; // Yellow for average
        return '#f44336'; // Red for poor
    };

    const getGradeLabel = (score: number) => {
        if (score >= 8.5) return 'Excellent';
        if (score >= 7.0) return 'Good';
        if (score >= 5.5) return 'Average';
        return 'Poor';
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return '#f44336'; // Red
            case 'medium':
                return '#FF9800'; // Orange
            case 'low':
                return '#4CAF50'; // Green
            default:
                return '#757575'; // Gray
        }
    };

    const getRiskLevelIcon = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return 'warning';
            case 'medium':
                return 'alert-circle';
            case 'low':
                return 'checkmark-circle';
            default:
                return 'help-circle';
        }
    };

    const getRiskLevelBackground = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return '#FFEBEE'; // Light red
            case 'medium':
                return '#FFF3E0'; // Light orange
            case 'low':
                return '#E8F5E8'; // Light green
            default:
                return '#F5F5F5'; // Light gray
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-3 text-base text-gray-600">Loading notification...</Text>
            </View>
        );
    }

    if (!notification) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 px-10">
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
                <Text className="mt-4 text-lg text-red-500 text-center mb-6">Notification not found</Text>
                <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg" onPress={() => router.back()}>
                    <Text className="text-white text-base font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 0 : 20 }}>
                <View className="flex-row justify-between items-center px-4 py-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-black">Notification Details</Text>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Main Content Card */}
                <View className="bg-white rounded-2xl p-5 my-4 shadow-sm">
                    {/* Status Badge */}
                    <View
                        className="flex-row items-center self-start px-3 py-1.5 rounded-full mb-5"
                        style={{ backgroundColor: getStatusColor(notification.status) }}
                    >
                        <Ionicons
                            name={getStatusIcon(notification.status) as any}
                            size={16}
                            color="#fff"
                        />
                        <Text className="text-white text-xs font-semibold ml-1">{notification.status}</Text>
                    </View>

                    {/* Course Info */}
                    <View className="mb-5">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center mr-3">
                                <Ionicons name="book" size={20} color="#007AFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-black">
                                    {notification.enrollmentId?.courseId?.subjectId?.subjectCode || "N/A"}
                                </Text>
                                <Text className="text-sm text-gray-600 mt-0.5">
                                    {notification.enrollmentId?.courseId?.subjectId?.subjectName || "No subject name"}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-0.5">
                                    {notification.enrollmentId?.courseId?.semesterId?.semesterName || "No semester info"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Risk Status */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Risk Status</Text>
                        <View
                            className="flex-row items-center self-start px-4 py-3 rounded-lg"
                            style={{ backgroundColor: getRiskLevelBackground(notification.riskLevel) }}
                        >
                            <Ionicons
                                name={getRiskLevelIcon(notification.riskLevel) as any}
                                size={20}
                                color={getRiskLevelColor(notification.riskLevel)}
                            />
                            <Text
                                className="text-base font-semibold ml-2"
                                style={{ color: getRiskLevelColor(notification.riskLevel) }}
                            >
                                {notification.riskLevel ? `${notification.riskLevel.toUpperCase()} Risk` : 'Unknown Risk'}
                            </Text>
                        </View>
                    </View>

                    {/* Grade Information */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Grade Details</Text>
                        <View className="bg-gray-50 rounded-xl p-4">
                            {notification.enrollmentId?.grade && Array.isArray(notification.enrollmentId.grade) && notification.enrollmentId.grade.length > 0 ? (
                                <>
                                    {/* Overall Grade */}
                                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                        <Text className="text-sm text-gray-600 mb-2 uppercase tracking-wide">Overall Grade</Text>
                                        <View className="flex-row items-center justify-between">
                                            <Text
                                                className="text-3xl font-bold"
                                                style={{ color: getGradeColor(calculateOverallGrade(notification.enrollmentId.grade)) }}
                                            >
                                                {calculateOverallGrade(notification.enrollmentId.grade)?.toFixed(2) || 'N/A'}
                                            </Text>
                                            <Text
                                                className="text-base font-semibold"
                                                style={{ color: getGradeColor(calculateOverallGrade(notification.enrollmentId.grade)) }}
                                            >
                                                {getGradeLabel(calculateOverallGrade(notification.enrollmentId.grade))}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Individual Grades */}
                                    <Text className="text-base font-semibold text-gray-800 mb-3">Individual Grades</Text>
                                    {notification.enrollmentId.grade.map((grade, index) => (
                                        <View key={index} className="bg-white rounded-lg p-3 mb-2">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-base font-semibold text-gray-800">{grade.type || 'Unknown'}</Text>
                                                <Text className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    Weight: {grade.weight != null ? (grade.weight * 100).toFixed(0) : 'N/A'}%
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Text
                                                    className="text-lg font-bold mr-3 min-w-[50px]"
                                                    style={{ color: getGradeColor(grade.score ?? 0) }}
                                                >
                                                    {grade.score != null ? grade.score.toFixed(2) : 'N/A'}
                                                </Text>
                                                <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${grade.score != null ? (grade.score / 10) * 100 : 0}%`,
                                                            backgroundColor: getGradeColor(grade.score ?? 0)
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            ) : (
                                <View className="bg-white rounded-lg p-6 items-center">
                                    <Ionicons name="school-outline" size={48} color="#ccc" />
                                    <Text className="text-base text-gray-500 mt-3 text-center">No grade information available</Text>
                                    <Text className="text-sm text-gray-400 mt-1 text-center">Grades will appear here once available</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Alert Title */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Alert Title</Text>
                        <Text className="text-lg font-semibold text-black leading-6">{notification.title}</Text>
                    </View>

                    {/* Alert Content */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Description</Text>
                        <Text className="text-base text-gray-700 leading-6">{notification.content}</Text>
                    </View>

                    {/* Date Info */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Created</Text>
                        <Text className="text-base text-gray-600">{formatDate(notification.createdAt)}</Text>
                    </View>

                    {/* Student Info */}
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Student Information</Text>
                        <View className="flex-row bg-gray-50 rounded-xl p-4 items-center">
                            <Image
                                source={{ uri: notification.enrollmentId.studentId.image }}
                                className="w-12 h-12 rounded-full mr-3"
                            />
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-black">
                                    {notification.enrollmentId.studentId.firstName} {notification.enrollmentId.studentId?.lastName}
                                </Text>
                                <Text className="text-sm text-gray-600 mt-0.5">
                                    {notification.enrollmentId.studentId.email}
                                </Text>
                                <View className="self-start bg-green-100 px-2 py-1 rounded mt-1.5">
                                    <Text className="text-xs text-green-600 font-semibold">
                                        {notification.enrollmentId.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Supervisor Response */}
                    {notification.supervisorResponse && (
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Supervisor Response</Text>
                            <View className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="person-circle" size={24} color="#4CAF50" />
                                    <Text className="text-base font-semibold text-green-600 ml-2">Response</Text>
                                </View>
                                <Text className="text-base text-green-800 leading-6 mb-4">
                                    {notification.supervisorResponse.response}
                                </Text>

                                {notification.supervisorResponse.plan && (
                                    <>
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="clipboard" size={20} color="#FF9800" />
                                            <Text className="text-sm font-semibold text-orange-600 ml-2">Action Plan</Text>
                                        </View>
                                        <Text className="text-base text-orange-800 leading-6 mb-3 italic">
                                            {notification.supervisorResponse.plan}
                                        </Text>
                                    </>
                                )}

                                <Text className="text-xs text-gray-600 text-right">
                                    Responded on {formatDate(notification.supervisorResponse.createdAt)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

        </View>
    );
};

export default NotificationDetailScreen;
