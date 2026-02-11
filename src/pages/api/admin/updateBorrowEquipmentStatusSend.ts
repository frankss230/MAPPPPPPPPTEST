import type { NextApiRequest, NextApiResponse } from 'next';
import authMiddleware from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';
import { replyNotificationSendDocQuery } from '@/utils/apiLineReply';
import { decrypt, encrypt } from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PUT') {
        try {
            const { status, user_id, borrow_id } = req.body;
            if (!status || !user_id || !borrow_id) {
                return res.status(401).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
            }

            const borrowequipment = await prisma.borrowequipment.findFirst({
                where: {
                    borrow_id: borrow_id
                },
                select: {
                    users_id_ref: {
                        select: {
                            users_line_id: true
                        }
                    }
                }
            });

            // ตรวจสอบว่ามีค่า users_line_id หรือไม่
            const replyToken = borrowequipment?.users_id_ref?.users_line_id ?? '';
            if (replyToken) {
                await replyNotificationSendDocQuery({
                    replyToken,
                    userData: {
                        borrow_id: encrypt(borrow_id.toString())
                    }
                });
                await prisma.borrowequipment.update({
                    where: {
                        borrow_id: borrow_id
                    },
                    data: {
                        borrow_send_status: 2,
                        borrow_send_date: new Date()
                    }
                });
            } else {
                return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ยืม' });
            }

            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            console.log("🚀 ~ handler ~ error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้', error: errorMessage });
        }
    }
};

export default authMiddleware(handler);
