import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
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

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await myAxios.get('alerts');
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <SafeAreaView style={styles.statusBarSafeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
            </SafeAreaView>

            {/* Notifications List */}
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading notifications...</Text>
                    </View>
                ) : notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications found</Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification._id}
                            style={styles.notificationCard}
                            onPress={() => handleNotificationPress(notification)}
                        >
                            <View style={styles.notificationIcon}>
                                <Ionicons name="warning-outline" size={22} color="#999" />
                            </View>
                            <View style={styles.notificationContent}>
                                <Text style={styles.courseCode}>
                                    {notification.enrollmentId.courseId.subjectId?.subjectCode || "N/A"}
                                </Text>
                                <Text style={styles.notificationText} numberOfLines={3}>
                                    {notification.title}
                                </Text>
                                <Text style={styles.timestampText}>
                                    {formatTimeAgo(notification.createdAt)}
                                </Text>
                            </View>
                            {!notification.isRead && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push("/(tabs)/home")}
                    >
                        <Ionicons name="home-outline" size={24} color="#999" />
                        <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push("/(tabs)/chat")}
                    >
                        <Ionicons name="chatbubble-outline" size={24} color="#999" />
                        <Text style={styles.navText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push("/(tabs)/my-course")}
                    >
                        <Ionicons name="book-outline" size={24} color="#999" />
                        <Text style={styles.navText}>My Course</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navItem}
                        onPress={() => router.push("/(tabs)/profile")}
                    >
                        <Ionicons name="person-outline" size={24} color="#999" />
                        <Text style={styles.navText}>My Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    statusBarSafeArea: {
        backgroundColor: "#fff",
        paddingTop: 12
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#000",
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    notificationCard: {
        flexDirection: "row",
        backgroundColor: "#E8E8E8",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: "flex-start",
    },
    notificationIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    notificationContent: {
        flex: 1,
    },
    courseCode: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    notificationText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    timestampText: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        backgroundColor: "#007AFF",
        borderRadius: 4,
        position: "absolute",
        top: 16,
        right: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    bottomSection: {
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    forgotPasswordButton: {
        alignSelf: "center",
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: "#999",
        fontSize: 16,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navItem: {
        alignItems: "center",
        flex: 1,
    },
    navText: {
        color: "#999",
        fontSize: 12,
        marginTop: 4,
    },
});

export default NotificationsScreen;
