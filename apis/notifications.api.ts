import myAxios from '../utils/my-axios';

export interface NotificationData {
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

export interface MarkAsReadRequest {
    supervisorResponse?: {
        response: string;
        plan: string;
    };
    status?: string;
    riskLevel?: string;
    isRead: string;
}

export const getNotifications = async (studentId: string): Promise<{ data: NotificationData[] }> => {
    const response = await myAxios.get('alerts', {
        params: {
            studentId: studentId
        }
    });
    return response.data;
};

export const getNotificationDetail = async (notificationId: string): Promise<NotificationData> => {
    const response = await myAxios.get(`alerts/${notificationId}`);
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string, data: MarkAsReadRequest): Promise<NotificationData> => {
    const response = await myAxios.patch(`alerts/${notificationId}`, data);
    return response.data;
};
