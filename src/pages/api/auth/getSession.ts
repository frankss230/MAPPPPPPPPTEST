import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import authMiddleware from '@/lib/authMiddleware';


const handler = (req: NextApiRequest, res: NextApiResponse ) => {
    if (req.method === 'GET') {
        const data = {
            user:{
                userName  : (req as any).user.userName,
                userId    : (req as any).user.userId,
                permission: (req as any).user.permission
            },
            accessToken: (req as any).userAccessToken || null
        }
        return res.status(200).json({ message: 'Success', ...data });
    }else{
       return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default authMiddleware(handler);