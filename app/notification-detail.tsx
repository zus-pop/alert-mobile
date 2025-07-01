import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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

    const fetchNotificationDetail = async () => {
        try {
            setLoading(true);
            console.log('Calling API with URL:', `alerts/${notificationId}`);
            const response = await myAxios.get(`alerts/${notificationId}`);
            console.log('API Response:', response.data);

            // Try different response structures
            if (response.data) {
                setNotification(response.data);
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading notification...</Text>
            </View>
        );
    }

    if (!notification) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
                <Text style={styles.errorText}>Notification not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notification Details</Text>
                    <View style={styles.placeholder} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Content Card */}
                <View style={styles.mainCard}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(notification.status) }]}>
                        <Ionicons
                            name={getStatusIcon(notification.status) as any}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.statusText}>{notification.status}</Text>
                    </View>

                    {/* Course Info */}
                    <View style={styles.courseInfoSection}>
                        <View style={styles.courseHeader}>
                            <View style={styles.courseIcon}>
                                <Ionicons name="book" size={20} color="#007AFF" />
                            </View>
                            <View style={styles.courseDetails}>
                                <Text style={styles.courseCode}>
                                    {notification.enrollmentId.courseId.subjectId?.subjectCode || "N/A"}
                                </Text>
                                <Text style={styles.courseName}>
                                    {notification.enrollmentId.courseId.subjectId.subjectName}
                                </Text>
                                <Text style={styles.semester}>
                                    {notification.enrollmentId.courseId.semesterId.semesterName}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Alert Title */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Alert Title</Text>
                        <Text style={styles.alertTitle}>{notification.title}</Text>
                    </View>

                    {/* Alert Content */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.alertContent}>{notification.content}</Text>
                    </View>

                    {/* Date Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Created</Text>
                        <Text style={styles.dateText}>{formatDate(notification.createdAt)}</Text>
                    </View>

                    {/* Student Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Student Information</Text>
                        <View style={styles.studentCard}>
                            <Image
                                source={{ uri: notification.enrollmentId.studentId.image }}
                                style={styles.studentAvatar}
                            />
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>
                                    {notification.enrollmentId.studentId.firstName} {notification.enrollmentId.studentId.lastName}
                                </Text>
                                <Text style={styles.studentEmail}>
                                    {notification.enrollmentId.studentId.email}
                                </Text>
                                <View style={styles.enrollmentBadge}>
                                    <Text style={styles.enrollmentStatus}>
                                        {notification.enrollmentId.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Supervisor Response */}
                    {notification.supervisorResponse && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Supervisor Response</Text>
                            <View style={styles.responseCard}>
                                <View style={styles.responseHeader}>
                                    <Ionicons name="person-circle" size={24} color="#4CAF50" />
                                    <Text style={styles.responseTitle}>Response</Text>
                                </View>
                                <Text style={styles.responseText}>
                                    {notification.supervisorResponse.response}
                                </Text>

                                {notification.supervisorResponse.plan && (
                                    <>
                                        <View style={styles.planHeader}>
                                            <Ionicons name="clipboard" size={20} color="#FF9800" />
                                            <Text style={styles.planTitle}>Action Plan</Text>
                                        </View>
                                        <Text style={styles.planText}>
                                            {notification.supervisorResponse.plan}
                                        </Text>
                                    </>
                                )}

                                <Text style={styles.responseDate}>
                                    Responded on {formatDate(notification.supervisorResponse.createdAt)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.markReadButton]}
                    onPress={() => {
                        // Mark as read functionality
                        Alert.alert('Info', 'Mark as read functionality to be implemented');
                    }}
                >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Mark as Read</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => {
                        // Share functionality
                        Alert.alert('Info', 'Share functionality to be implemented');
                    }}
                >
                    <Ionicons name="share" size={20} color="#007AFF" />
                    <Text style={[styles.buttonText, { color: '#007AFF' }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        paddingHorizontal: 40,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        color: "#f44336",
        textAlign: "center",
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    header: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        paddingTop: 16,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backIcon: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    mainCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginVertical: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    courseInfoSection: {
        marginBottom: 20,
    },
    courseHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    courseIcon: {
        width: 40,
        height: 40,
        backgroundColor: "#E3F2FD",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    courseDetails: {
        flex: 1,
    },
    courseCode: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },
    courseName: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    semester: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        lineHeight: 24,
    },
    alertContent: {
        fontSize: 16,
        color: "#444",
        lineHeight: 24,
    },
    dateText: {
        fontSize: 16,
        color: "#666",
    },
    studentCard: {
        flexDirection: "row",
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    studentAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    studentEmail: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    enrollmentBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#E8F5E8",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 6,
    },
    enrollmentStatus: {
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "600",
    },
    responseCard: {
        backgroundColor: "#F0F8F0",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#4CAF50",
    },
    responseHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    responseTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4CAF50",
        marginLeft: 8,
    },
    responseText: {
        fontSize: 16,
        color: "#2E7D2E",
        lineHeight: 24,
        marginBottom: 16,
    },
    planHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    planTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FF9800",
        marginLeft: 8,
    },
    planText: {
        fontSize: 16,
        color: "#E65100",
        lineHeight: 24,
        marginBottom: 12,
        fontStyle: "italic",
    },
    responseDate: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
    },
    actionButtons: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    markReadButton: {
        backgroundColor: "#4CAF50",
    },
    shareButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 8,
    },
});

export default NotificationDetailScreen;
