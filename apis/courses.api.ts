import myAxios from "../utils/my-axios";

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

export interface CourseData {
    _id: string;
    subjectId: Subject | null;
    semesterId: Semester;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface ApiResponse {
    data: CourseData[];
    totalItems: number;
    totalPage: number;
}

export async function getCourses(): Promise<ApiResponse> {
    try {
        const response = await myAxios.get("/courses");
        return response.data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
}
