import myAxios from '../utils/my-axios';

export interface Grade {
    type: string;
    weight: number;
    score: number;
}

export interface Subject {
    _id: string;
    subjectCode: string;
    subjectName: string;
}

export interface Semester {
    _id: string;
    semesterName: string;
    startDate: string;
    endDate: string;
}

export interface Course {
    _id: string;
    subjectId: Subject | null;
    semesterId: Semester;
}

export interface Enrollment {
    _id: string;
    courseId: Course;
    studentId: string;
    enrollmentDate: string;
    grade: Grade[];
    status: string;
}

export interface EnrollmentStatusGroup {
    status: string;
    count: number;
}

export interface EnrollmentResponse {
    data: Enrollment[];
    totalItems: number;
    totalPage: number;
    groupByEnrollmentStatus: EnrollmentStatusGroup[];
}

export const getStudentEnrollments = async (
    studentId: string,
    order?: string,
    page?: number,
    limit?: number
): Promise<EnrollmentResponse> => {
    const params = new URLSearchParams();

    if (order) params.append('order', order);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `students/${studentId}/enrollments${queryString ? `?${queryString}` : ''}`;

    const response = await myAxios.get<EnrollmentResponse>(url);
    return response.data;
};
