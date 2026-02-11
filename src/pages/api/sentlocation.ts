import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getFlexTemplate, pushFlexMessage } from '@/utils/apiLineReply';
import moment from 'moment';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // รองรับทั้ง POST และ PUT
  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const { uId, takecare_id, distance, latitude, longitude, battery } = req.body;

      // ตรวจสอบพารามิเตอร์ (ปล่อยให้ 0 ผ่านได้)
      if (
        uId === undefined || takecare_id === undefined ||
        distance === undefined || latitude === undefined ||
        longitude === undefined || battery === undefined
      ) {
        return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ไม่ครบถ้วน' });
      }

      // ดึง Safezone
      const safezone = await prisma.safezone.findFirst({
        where: {
          takecare_id: Number(takecare_id),
          users_id: Number(uId),
        },
      });

      if (!safezone) {
        return res.status(404).json({ message: 'error', data: 'ไม่พบข้อมูล Safezone' });
      }

      const r1 = safezone.safez_radiuslv1;
      const r2 = safezone.safez_radiuslv2;
      const safezoneThreshold = r2 * 0.8;
      const distNum = Number(distance);

      // คำนวณสถานะ
      let calculatedStatus = 0;
      if (distNum <= r1) {
        calculatedStatus = 0;
      } else if (distNum > r1 && distNum < safezoneThreshold) {
        calculatedStatus = 1;
      } else if (distNum >= safezoneThreshold && distNum <= r2) {
        calculatedStatus = 3;
      } else if (distNum > r2) {
        calculatedStatus = 2;
      }

      // หาแถวล่าสุดของคู่ users_id + takecare_id
      const latest = await prisma.location.findFirst({
        where: {
          users_id: Number(uId),
          takecare_id: Number(takecare_id),
        },
        orderBy: { locat_timestamp: 'desc' },
      });

      // ข้อมูลที่จะบันทึก
      const dataPayload = {
        users_id: Number(uId),
        takecare_id: Number(takecare_id),
        locat_timestamp: new Date(),
        locat_latitude: String(latitude),
        locat_longitude: String(longitude),
        locat_status: calculatedStatus,
        locat_distance: Number(distance),
        locat_battery: Number(battery),
        locat_noti_time: new Date(),
        locat_noti_status: 1,
      };

      const previousStatus = latest ? Number(latest.locat_status) : null;

      // ถ้ามีแถวเดิม -> update ด้วย location_id ที่ถูกต้อง, ถ้าไม่มีก็ create
      let savedLocation;
      if (latest) {
        savedLocation = await prisma.location.update({
          where: { location_id: latest.location_id }, // ✅ แก้ตรงนี้
          data: dataPayload,
        });
      } else {
        savedLocation = await prisma.location.create({ data: dataPayload });
      }

      // ส่งแจ้งเตือนเฉพาะเมื่อสถานะเปลี่ยน
      if (previousStatus !== null && calculatedStatus === previousStatus) {
        return res.status(200).json({ message: 'success', data: savedLocation });
      }

      // แจ้งเตือน (Flex Message)
      const user = await prisma.users.findFirst({ where: { users_id: Number(uId) } });
      const takecareperson = await prisma.takecareperson.findFirst({
        where: {
          users_id: Number(uId),
          takecare_id: Number(takecare_id),
          takecare_status: 1,
        },
      });

      if (user && takecareperson) {
        const replyToken = user.users_line_id || '';

        if (replyToken) {
          const timeText = moment().format('DD/MM/YYYY HH:mm');
          const name = `${user.users_fname} ${user.users_sname}`;
          const postbackData =
            calculatedStatus === 2
              ? `userLineId=${replyToken}&takecarepersonId=${Number(takecare_id)}&type=safezone`
              : undefined;

          const contents = getFlexTemplate(
            calculatedStatus,
            name,
            String(latitude),
            String(longitude),
            timeText,
            postbackData
          );

          await pushFlexMessage({
            replyToken,
            altText: 'แจ้งเตือน Safezone',
            contents,
          });
        }
      }

      return res.status(200).json({ message: 'success', data: savedLocation });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'error', data: 'เกิดข้อผิดพลาดในการประมวลผล' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'POST']);
    return res.status(405).json({ message: `วิธี ${req.method} ไม่อนุญาต` });
  }
}
