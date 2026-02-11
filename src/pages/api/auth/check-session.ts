import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import authMiddleware from '@/lib/authMiddleware';


const handler = (req: NextApiRequest, res: NextApiResponse ) => {
    res.status(200).json({ message: 'Success', user: (req as any).user });
};

export default authMiddleware(handler);