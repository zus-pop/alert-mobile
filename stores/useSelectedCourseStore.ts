import { create } from 'zustand';

interface SelectedCourseStore {
  selectedCourseId: string | null;
  setSelectedCourseId: (courseId: string | null) => void;
  clearSelectedCourse: () => void;
}

export const useSelectedCourseStore = create<SelectedCourseStore>((set) => ({
  selectedCourseId: null,
  setSelectedCourseId: (courseId) => set({ selectedCourseId: courseId }),
  clearSelectedCourse: () => set({ selectedCourseId: null }),
})); 