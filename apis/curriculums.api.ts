import myAxios from '../utils/my-axios';

export interface Subject {
    _id: string;
    subjectCode: string;
    subjectName: string;
    semesterNumber?: number;
    studentData?: StudentData;
    credit?: number;
}

export interface StudentData {
    status: string;
    enrollmentId?: string;
    finalGrade?: string;
}
export interface Curriculum {
    _id: string;
    curriculumName: string;
    comboId?: string;
    subjects: Subject[];
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface CurriculumResponse {
    data: Curriculum[];
    totalItems: number;
    totalPage: number;
}


// Get all curriculums
export const getCurriculums = async (
    curriculumName?: string,
    comboId?: string,
    order?: string,
    page?: number,
    limit?: number
): Promise<CurriculumResponse> => {
    const params = new URLSearchParams();

    if (curriculumName) params.append('curriculumName', curriculumName);
    if (comboId) params.append('comboId', comboId);
    if (order) params.append('order', order);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `curriculums${queryString ? `?${queryString}` : ''}`;

    const response = await myAxios.get(url);
    return response.data;
};

// Get curriculum by ID
export const getCurriculumById = async (curriculumId: string | undefined, studentId?: string): Promise<Curriculum> => {
    let url = `curriculums/${curriculumId}`;
    if (studentId) {
        url += `?studentId=${studentId}`;
    }
    const response = await myAxios.get(url);
    console.log('Response data:', response.data);
    return response.data;
}; 