import type { NextApiRequest, NextApiResponse } from 'next';
import authMiddleware from '@/lib/authMiddleware';
import prisma from '@/lib/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse ) => {
    if (req.method === 'GET') {
        try {
            const { name } = req.query;
            const user = await prisma.users.findMany({
                where: {
                    NOT: {
                        users_id: 2
                    },
                    OR: [
                        {
                            users_fname: {
                                contains: name as string
                            }
                        },
                        {
                            users_sname: {
                                contains: name as string
                            }
                        }
                    ]
                },
                select:{
                    users_id:true,
                    users_fname: true,
                    users_sname: true,
                    users_status_id:{
                        select:{
                            status_name: true
                        }
                    },
                    users_status_onweb: true,
                    status_id: true,
                    users_status_active: true
                }
            })
            let items:any = user;
            return res.status(200).json({ message: 'Success', data:items});
            
        } catch (error) {
            return res.status(401).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
        }
    }else{
       return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default authMiddleware(handler);