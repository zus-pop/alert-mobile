import myAxios from '../utils/my-axios';

export interface Semester {
    _id: string;
    semesterName: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface SemesterResponse {
    data: Semester[];
    totalItems: number;
    totalPage: number;
}

export const getSemesters = async (
    semesterName?: string,
    startDate?: string,
    endDate?: string,
    order?: string,
    page?: number,
    limit?: number
): Promise<SemesterResponse> => {
    const params = new URLSearchParams();

    if (semesterName) params.append('semesterName', semesterName);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (order) params.append('order', order);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `semesters${queryString ? `?${queryString}` : ''}`;

    const response = await myAxios.get<SemesterResponse>(url);
    return response.data;
}; 