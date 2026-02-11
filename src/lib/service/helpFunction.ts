import axios from 'axios';

export const handleAxiosError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return error as string;
}

export const headers = (token: string) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
}
