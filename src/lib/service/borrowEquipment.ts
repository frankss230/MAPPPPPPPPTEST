import axios from 'axios';
import { headers } from './helpFunction';
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export const getBorrowEquipmentList = async (name: string, name_borrow: string, status: string) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.get(`/api/admin/getBorrowEquipmentList?name=${name}&name_borrow=${name_borrow}&status=${status}`, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getBorrowEquipmentListReturn = async (name: string, name_borrow: string, status: string) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.get(`/api/admin/getBorrowEquipmentListReturn?name=${name}&name_borrow=${name_borrow}&status=${status}`, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}

export const updateBorrowEquipmentStatus = async (status: number, user_id: number, borrow_id: number) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.put(`/api/admin/updateBorrowEquipmentStatus`,{
            status,
            user_id,
            borrow_id
        }, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}

export const updateBorrowEquipmentReturnStatus = async (status: number, user_id: number, borrow_id: number) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.put(`/api/admin/updateBorrowEquipmentReturnStatus`,{
            status,
            user_id,
            borrow_id
        }, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}

export const updateBorrowEquipmentStatusSend = async (status: number, user_id: number, borrow_id: number) => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.put(`/api/admin/updateBorrowEquipmentStatusSend`,{
            status,
            user_id,
            borrow_id
        }, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}