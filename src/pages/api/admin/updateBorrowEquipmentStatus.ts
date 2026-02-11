import type { NextApiRequest, NextApiResponse } from 'next';
import authMiddleware from '@/lib/authMiddleware';
import prisma from '@/lib/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse ) => {
    if (req.method === 'PUT') {
        try {
            const { status, user_id, borrow_id } = req.body;
            if(!status || !user_id || !borrow_id){
                return res.status(401).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
            }
            await prisma.borrowequipment.update({
                where: {
                    borrow_id: borrow_id
                },
                data: {
                    borrow_equipment_status: status,
                    borrow_approver        : user_id,
                    borrow_approver_date   : new Date(),
                    borrow_update_date     : new Date(),
                    borrow_update_user_id  : user_id
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