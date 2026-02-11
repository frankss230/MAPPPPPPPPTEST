import type { NextApiRequest, NextApiResponse } from 'next';
import authMiddleware from '@/lib/authMiddleware';
import prisma from '@/lib/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse ) => {
    if (req.method === 'PUT') {
        try {
            const { id, status } = req.body;
            if(!id || !status){
                return res.status(401).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
            }
            await prisma.users.update({
                where: {
                    users_id: id
                },
                data: {
                    users_status_id: {
                        connect: {
                          status_id: status
                        }
                    },
                    users_status_onweb: status > 1 ? 1 : 0
                }
            })

            return res.status(200).json({ message: 'Success'});
            
        } catch (error) {
            console.log("🚀 ~ handler ~ error:", error)
            return res.status(401).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
        }
    }else{
       return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default authMiddleware(handler);