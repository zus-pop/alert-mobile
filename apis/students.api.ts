import myAxios from '../utils/my-axios';

export interface StudentEnrollment {
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
    studentId: string;
    enrollmentDate: string;
    grade: {
        type: string;
        weight: number;
        score: number;
    }[];
    status: string;
    finalGrade?: number;
}

export interface AttendanceRecord {
    _id: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late';
    notes?: string;
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
        const response = await myAxios.get(`/api/students/${studentId}/enrollments/${enrollmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student enrollment:', error);
        throw error;
    }
}

// Get attendance records for a specific enrollment
export async function getStudentAttendances(studentId: string, enrollmentId: string): Promise<{ data: AttendanceRecord[] }> {
    try {
        const response = await myAxios.get(`/api/students/${studentId}/enrollments/${enrollmentId}/attendances`);
        console.log('Attendance records:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendances:', error);
        throw error;
    }
}
