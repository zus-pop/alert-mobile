import myAxios from '../utils/my-axios';

export interface StudentEnrollment {
    _id: string;
    courseId: {
        _id: string;
        subjectId: string;
        semesterId: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
        image: string;
    };
    studentId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        password: string;
        deviceTokens: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
        isDeleted: boolean;
        deletedAt: string | null;
        studentCode: string;
        image: string;
    };
    grade: {
        type: string;
        score: number;
        weight: number;
    }[];
    status: string;
    enrollmentDate: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    finalGrade?: number;
}

export interface AttendanceRecord {
    _id: string;
    enrollmentId: string;
    sessionId: {
        _id: string;
        startTime: string;
        endTime: string;
    };
    status: 'ATTENDED' | 'ABSENT' | 'NOT YET';
    __v: number;
    createdAt: string;
    updatedAt: string;
}

export interface StudyProgress {
    enrollmentId: string;
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    overallGrade: number;
    grades: {
        type: string;
        weight: number;
        score: number;
    }[];
    status: string;
}

// Get specific enrollment details for a student
export async function getStudentEnrollmentById(studentId: string, enrollmentId: string): Promise<{ data: StudentEnrollment }> {
    try {
        const response = await myAxios.get(`/students/${studentId}/enrollments/${enrollmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student enrollment:', error);
        throw error;
    }
}

// Get attendance records for a specific enrollment
export async function getStudentAttendances(studentId: string, enrollmentId: string): Promise<AttendanceRecord[]> {
    try {
        const response = await myAxios.get(`/students/${studentId}/enrollments/${enrollmentId}/attendances`);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendances:', error);
        throw error;
    }
}
