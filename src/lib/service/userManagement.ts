import axios from 'axios';
import { headers } from './helpFunction';
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export const getUsers = async (name: string) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.get(`/api/admin/getUsers?name=${name}`, headers(accessToken as string));
        return response.data;
    } catch (error) {
        console.error("Error creating admin:", error); // เพิ่มบรรทัดนี้
        throw error
    }
}

export const updateUserStatus = async (id: number, status: number) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.put(`/api/admin/updateUserStatus`, {id, status}, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}