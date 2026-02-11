import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import _ from 'lodash';
import { replyNotificationPostback, replyNotificationPostbackTemp } from '@/utils/apiLineReply';
import moment from 'moment';

type Data = {
    message: string;
    data?: any;
};

export default async function handle(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === 'PUT' || req.method === 'POST') {
        try {
            const body = req.body;

            if (!body.uId || !body.takecare_id || !body.temperature_value) {
                return res.status(400).json({ message: 'error', data: 'ไม่พบพารามิเตอร์ uId, takecare_id, temperature_value' });
            }

            if (_.isNaN(Number(body.uId)) || _.isNaN(Number(body.takecare_id)) || _.isNaN(Number(body.status))) {
                return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ uId, takecare_id, status ไม่ใช่ตัวเลข' });
            }

            const user = await prisma.users.findFirst({
                where: { users_id: Number(body.uId) },
                include: {
                    users_status_id: {
                        select: { status_name: true }
                    }
                }
            });

            const takecareperson = await prisma.takecareperson.findFirst({
                where: {
                    takecare_id: Number(body.takecare_id),
                    takecare_status: 1
                }
            });

            if (!user || !takecareperson) {
                return res.status(200).json({ message: 'error', data: 'ไม่พบข้อมูล user หรือ takecareperson' });
            }

            const settingTemp = await prisma.temperature_settings.findFirst({
                where: {
                    takecare_id: takecareperson.takecare_id,
                    users_id: user.users_id
                }
            });

            // เปรียบเทียบอุณหภูมิ
            const temperatureValue = Number(body.temperature_value);
            let calculatedStatus = Number(body.status);

            if (settingTemp && temperatureValue > settingTemp.max_temperature) {
                calculatedStatus = 1;
            } else {
                calculatedStatus = 0;
            }

            const status = calculatedStatus;

            let noti_time: Date | null = null;
            let noti_status: number | null = null;

            const temp = await prisma.temperature_records.findFirst({
                where: {
                    users_id: user.users_id,
                    takecare_id: takecareperson.takecare_id
                },
                orderBy: {
                    noti_time: 'desc'
                }
            });

            if (status === 1 && (!temp || temp.noti_status !== 1 || moment().diff(moment(temp.noti_time), 'minutes') >= 5)) {
                const message = `คุณ ${takecareperson.takecare_fname} ${takecareperson.takecare_sname} \nอุณหภูมิร่างกายเกินค่าที่กำหนด`;

                const replyToken = user.users_line_id || '';
                if (replyToken) {
                    await replyNotificationPostbackTemp({
                        replyToken,
                        userId: user.users_id,
                        takecarepersonId: takecareperson.takecare_id,
                        type: 'temperature',
                        message
                    });
                }

                noti_status = 1;
                noti_time = new Date();
            }

            if (status === 0) {
                noti_status = 0;
                noti_time = null;
                console.log("อุณหภูมิอยู่ในระดับปกติ");
                // console.log(`อุณหภูมิอยู่ในระดับปกติ (${temperatureValue} °C)`);
            }

            if (temp) {
                await prisma.temperature_records.update({
                    where: {
                        temperature_id: temp.temperature_id
                    },
                    data: {
                        temperature_value: temperatureValue,
                        record_date: new Date(),
                        status: status,
                        noti_time: noti_time,
                        noti_status: noti_status
                    }
                });
            } else {
                await prisma.temperature_records.create({
                    data: {
                        users_id: user.users_id,
                        takecare_id: takecareperson.takecare_id,
                        temperature_value: temperatureValue,
                        record_date: new Date(),
                        status: status,
                        noti_time: noti_time,
                        noti_status: noti_status
                    }
                });
            }

            return res.status(200).json({ message: 'success', data: 'บันทึกข้อมูลเรียบร้อย' });

        } catch (error) {
            console.error("🚀 ~ API /temperature error:", error);
            return res.status(400).json({ message: 'error', data: error });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'POST']);
        return res.status(405).json({ message: 'error', data: `วิธี ${req.method} ไม่อนุญาต` });
    }
}
