import type { NextApiRequest, NextApiResponse } from 'next'; 
import prisma from '@/lib/prisma';
import { hash, genSalt } from 'bcrypt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {
            username, password, fname, sname, users_pin,
            users_line_id, users_status_onweb, users_number,
            users_moo, users_road, users_tubon, users_amphur,
            users_province, users_postcode, users_tel1,
            users_alert_battery, users_status_active,
            users_related_borrow, users_token, status_id
        } = req.body;

        // ตรวจสอบว่าข้อมูลครบถ้วน
        if (
            !username || !password || !fname || !sname || 
            typeof users_pin === 'undefined'
        ) {
            return res.status(400).json({ message: 'กรุณาระบุข้อมูล Username, Password, ชื่อ, นามสกุล และ PIN' });
        }

        try {
            // เข้ารหัสรหัสผ่าน
            const hashedPassword = await hash(password, await genSalt(10));

            // เพิ่มข้อมูลผู้ใช้ลงในฐานข้อมูล
            const newUser = await prisma.users.create({
                data: {
                    users_user: username,
                    users_passwd: hashedPassword,
                    status_id: status_id || 1, // ใช้ค่า status_id จากคำขอ ถ้าไม่มีให้ใช้ 1 เป็นค่าเริ่มต้น
                    users_status_onweb: users_status_onweb || 1,
                    users_status_active: users_status_active || 1,
                    users_line_id: users_line_id || "",
                    users_fname: fname,
                    users_sname: sname,
                    users_pin: users_pin,
                    users_number: users_number || null,
                    users_moo: users_moo || null,
                    users_road: users_road || null,
                    users_tubon: users_tubon || null,
                    users_amphur: users_amphur || null,
                    users_province: users_province || null,
                    users_postcode: users_postcode || null,
                    users_tel1: users_tel1 || null,
                    users_alert_battery: users_alert_battery || 0,
                    users_related_borrow: users_related_borrow || null,
                    users_token: users_token || null,
                }
            });
            

            return res.status(201).json({ message: 'สร้างบัญชีผู้ใช้สำเร็จ', user: newUser });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default handler;
