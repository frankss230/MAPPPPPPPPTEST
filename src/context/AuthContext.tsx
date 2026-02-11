import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

import { handleAxiosError } from '@/lib/service/helpFunction';
import { loginService, getSessionService } from '@/lib/service/auth';

import { useDispatch } from 'react-redux';
import { setDataUser, removeDataUser } from '@/redux/features/user';
import { AppDispatch } from '@/redux/store';
import Cookies from 'js-cookie';

interface AuthContextProps {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!token;
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            getUser(storedToken)
            
        }else{
            setLoading(false);
        }

    }, []);

    const getUser = async (storedToken: string) => {
        try {
            const response = await getSessionService(storedToken);
            setLoading(false);
            if(response){
                let accessToken =  localStorage.getItem('token');
                if(response?.accessToken){
                    setToken(response?.accessToken);
                    localStorage.setItem('token', response?.accessToken);
                    accessToken = response?.accessToken;
                }
                dispatch(setDataUser({...response?.user, accessToken}));
                Cookies.set('currentUser', JSON.stringify(response?.user));
            }else{
                logout();
            }
        } catch (error) {
            setLoading(false);
            const errorMessage = handleAxiosError(error);
            logout();
        }
    }
    const login = async (username: string, password: string) => {
        try {
            const response = await loginService(username, password);
            if(response){
                if(response?.accessToken){
                    setToken(response?.accessToken);
                    localStorage.setItem('token', response?.accessToken);
                }
               
                dispatch(setDataUser({...response?.user, accessToken: response?.accessToken}));
                Cookies.set('currentUser', JSON.stringify(response?.user))
            }
            router.push('/admin/dashboard');
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            throw errorMessage;
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        dispatch(removeDataUser());
        Cookies.remove('currentUser');
        router.push('/admin/login');
    };
// console.log('isAuthenticated', isAuthenticated)
    return (
        <AuthContext.Provider value={{ token, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
