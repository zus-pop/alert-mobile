import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { IconSymbol } from "../components/ui/IconSymbol";
import { useAuthStore } from "../stores/useAuthStore";
import myAxios from "../utils/my-axios";

interface NotificationData {
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
        grade: any[];
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

const NotificationsScreen: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const { accessToken, refreshToken, user } = useAuthStore();

    useEffect(() => {
        // Console log token information from store
        console.log('=== AUTH STORE TOKEN INFO ===');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('User Info:', user);
        console.log('=============================');

        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await myAxios.get('alerts', {
                params: {
                    studentId: user?._id
                }
            });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };



    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const notificationDate = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        }
    };

    const handleNotificationPress = (notification: NotificationData) => {
        router.push({
            pathname: '/notification-detail' as any,
            params: { notificationId: notification._id }
        });
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={true} />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 0 : 20 }}>
                <View className="bg-white px-5 py-4 border-b border-gray-200">
                    <Text className="text-2xl font-semibold text-black">Notifications</Text>
                </View>
            </SafeAreaView>

            {/* Notifications List */}
            <ScrollView
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                {loading ? (
                    <View className="flex-1 justify-center items-center py-15">
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text className="mt-3 text-base text-gray-600">Loading notifications...</Text>
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-15">
                        <Ionicons name="notifications-outline" size={64} color="#ccc" />
                        <Text className="mt-4 text-base text-gray-600 text-center">No notifications found</Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification._id}
                            className="flex-row bg-gray-200 rounded-2xl p-4 mb-3 items-start"
                            onPress={() => handleNotificationPress(notification)}
                        >
                            <View className="mr-3 mt-0.5">
                                <Ionicons name="warning-outline" size={22} color="#999" />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-base font-semibold text-gray-800">
                                        {notification.enrollmentId?.courseId?.subjectId?.subjectCode || "N/A"}
                                    </Text>
                                    {!notification.isRead && (
                                        <View className="bg-blue-500 px-2 py-1 rounded-full">
                                            <Text className="text-white text-xs font-medium">New</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                                    {notification.title}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1">
                                    {formatTimeAgo(notification.createdAt)}
                                </Text>
                            </View>

                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={{
                backgroundColor: "#F5F6FA",
                borderRadius: 24,
                margin: 16,
                padding: 6,
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: 80,
            }}>
                <TouchableOpacity
                    style={{ alignItems: "center", flex: 1, paddingVertical: 8, justifyContent: 'space-evenly' }}
                    onPress={() => router.push("/(tabs)/home")}
                >
                    <IconSymbol size={24} name="house.fill" color="#0a7ea4" />
                    <Text style={{ color: "#0a7ea4", fontSize: 12, fontWeight: "600", marginTop: 2 }}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignItems: "center", flex: 1, paddingVertical: 8, justifyContent: 'space-evenly' }}
                    onPress={() => router.push("/(tabs)/chat")}
                >
                    <IconSymbol size={24} name="chat.fill" color="#687076" />
                    <Text style={{ color: "#687076", fontSize: 12, marginTop: 2 }}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignItems: "center", flex: 1, paddingVertical: 8, justifyContent: 'space-evenly' }}
                    onPress={() => router.push("/(tabs)/my-course")}
                >
                    <IconSymbol size={24} name="book.fill" color="#687076" />
                    <Text style={{ color: "#687076", fontSize: 12, marginTop: 2 }}>My Course</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignItems: "center", flex: 1, paddingVertical: 8, justifyContent: 'space-evenly' }}
                    onPress={() => router.push("/(tabs)/profile")}
                >
                    <IconSymbol size={24} name="person.fill" color="#687076" />
                    <Text style={{ color: "#687076", fontSize: 12, marginTop: 2 }}>My Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NotificationsScreen;
