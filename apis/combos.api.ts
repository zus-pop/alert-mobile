import myAxios from '../utils/my-axios';

export interface Combo {
    _id: string;
    comboCode: string;
    comboName: string;
    description?: string;
    majorId?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export const getComboById = async (comboId: string): Promise<Combo> => {
    const response = await myAxios.get(`/combos/${comboId}`);
    return response.data;
};
