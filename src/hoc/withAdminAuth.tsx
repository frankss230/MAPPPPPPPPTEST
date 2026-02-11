import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const withAdminAuth = (WrappedComponent: React.ComponentType) => {
    const ComponentWithAdminAuth = (props: any) => {
        const { isAuthenticated } = useAuth();
        const router = useRouter();
        console.log('isAuthenticated', isAuthenticated)
        useEffect(() => {
            if (!isAuthenticated) {
                // router.replace('/admin/login');
            }
        }, [isAuthenticated, router]);

        if (!isAuthenticated) {
            return null; // or a loading spinner, etc.
        }

        return <WrappedComponent {...props} />;
    };

    return ComponentWithAdminAuth;
};

export default withAdminAuth;
