import { NextApiRequest, NextApiResponse } from 'next' 
import prisma from '@/lib/prisma'
import { replyNotificationSOS } from '@/utils/apiLineReply'

type Data = {
	message: string;
	data?: any;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
        if (req.headers['content-type'] !== 'application/json') {
            return res.status(400).json({ message: 'error', error: "Content-Type must be application/json" });
        }

        const body = req.body;
        const { uid } = req.body;
        console.log("📥 Received Request Body:", req.body);
        console.log("🔍 Checking UID:", uid);
        if (!body.uid) {
            return res.status(400).json({ message: 'error', data: 'ไม่พบพารามิเตอร์ uid' });
        }
        
        if (isNaN(Number(body.uid))) {
            return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ uid ไม่ใช่ตัวเลข' });
        }
        
        try {
            const user = await prisma.users.findFirst({
                where: {
                    users_id: Number(body.uid)
                }
            });

            const takecareperson = await prisma.takecareperson.findFirst({
                where: {
                    users_id: user?.users_id,
                    takecare_status: 1
                }
            });

            if (user && takecareperson) {
                const message = `คุณ ${takecareperson.takecare_fname} ${takecareperson.takecare_sname}  \nขอความช่วยเหลือ ฉุกเฉิน`;
                
                // ตรวจสอบว่า users_line_id ไม่เป็น null
                const replyToken = user.users_line_id || '';

                await replyNotificationSOS({ replyToken, message });

                return res.status(200).json({ message: 'success', data: user });
            } else {
                return res.status(400).json({ message: 'error', data: 'ไม่พบข้อมูล' });
            }
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: 'error', data: 'เกิดข้อผิดพลาดในการประมวลผล' });
        }
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ message: `วิธี ${req.method} ไม่อนุญาต` });
	}
}
