import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma'
// import { matchPassword } from '@/utils/helpers'
import { compare, genSalt, hash } from 'bcrypt';
import authMiddleware from '@/lib/authMiddleware';

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not set');
}


const handler = async (req: NextApiRequest, res: NextApiResponse ) => {
    if (req.method === 'POST') {
        const { user_id, old_password, new_password } = req.body;
        if (!user_id || !old_password || !new_password) {
            return res.status(401).json({ message: 'พารามิเตอร์ไม่ครบ' });
        }
        try {
            
           const user = await prisma.users.findFirst({
                where: {
                    users_id         : user_id
                }
            })

            if (!user) {
                return res.status(401).json({ message: 'User ไม่ถูกต้อง' });
            }
            const isPasswordMatch = await matchPassword(user.users_passwd, old_password);
            if (!isPasswordMatch) {
                return res.status(401).json({ message: 'Password ไม่ถูกต้อง' });
            }

            await prisma.users.update({
                where: {
                    users_id: user_id
                },
                data:{
                    users_passwd: await hash(new_password, await genSalt(8))
                }
            });

            return res.status(200).json({ message: 'Success' });

        } catch (error) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
};

export const matchPassword = async (oldPassword: string, password: string): Promise<boolean> => {
    return compare(password, oldPassword);
};

export default authMiddleware(handler);