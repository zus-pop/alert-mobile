import myAxios from '../utils/my-axios';

export interface Subject {
    _id: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    description?: string;
}

export interface Curriculum {
    _id: string;
    curriculumName: string;
    curriculumCode?: string;
    description?: string;
    subjects: Subject[];
    createdAt: string;
    updatedAt: string;
}

export interface CurriculumResponse {
    data: Curriculum[];
    totalItems: number;
    totalPage: number;
}

export interface SingleCurriculumResponse {
    data: Curriculum;
}

// Alternative type for direct curriculum response
export type CurriculumAPIResponse = Curriculum | SingleCurriculumResponse;

// Get all curriculums
export const getCurriculums = async (
    curriculumName?: string,
    curriculumCode?: string,
    order?: string,
    page?: number,
    limit?: number
): Promise<CurriculumResponse> => {
    const params = new URLSearchParams();

    if (curriculumName) params.append('curriculumName', curriculumName);
    if (curriculumCode) params.append('curriculumCode', curriculumCode);
    if (order) params.append('order', order);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `curriculums${queryString ? `?${queryString}` : ''}`;

    const response = await myAxios.get<CurriculumResponse>(url);
    return response.data;
};

// Get curriculum by ID
export const getCurriculumById = async (curriculumId: string): Promise<CurriculumAPIResponse> => {
    const response = await myAxios.get(`curriculums/${curriculumId}`);
    console.log('Raw API response for curriculum:', response);
    console.log('Response data:', response.data);
    return response.data;
}; 