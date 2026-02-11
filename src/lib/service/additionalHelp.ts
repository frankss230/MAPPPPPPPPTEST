import axios from 'axios';
import { headers } from './helpFunction';

export const getHelp = async () => {
    try {
        let accessToken =  localStorage.getItem('token');
        const response = await axios.get(`/api/admin/getHelp`, headers(accessToken as string));
        return response.data;
    } catch (error) {
        throw error
    }
}