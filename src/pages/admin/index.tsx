import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

const AdminIndex = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/admin/login');
        } else {
            router.replace('/admin/dashboard');
        }
    }, [isAuthenticated, router]);

    return null; // Or a loading spinner
};

export default AdminIndex;
