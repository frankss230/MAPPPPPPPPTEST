import type { NextApiRequest, NextApiResponse } from 'next';
import authMiddleware from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
        try {
            const { name, name_borrow, status } = req.query;
            const filters: any = {
                borrow_delete_date: null,
                borrow_name: {
                    contains: name_borrow as string,
                },
                OR: [
                    {
                        users_id_ref: {
                            users_fname: {
                                contains: name as string,
                            },
                        },
                    },
                    {
                        users_id_ref: {
                            users_sname: {
                                contains: name as string,
                            },
                        },
                    },
                ],
            };

            if (status) {
                filters.borrow_equipment_status = parseInt(status as string);
            }

            // ✅ คิวรี่ข้อมูลการยืมอุปกรณ์
            const borrowequipment = await prisma.borrowequipment.findMany({
                where: filters,
                select: {
                    borrow_id: true,
                    borrow_name: true,
                    borrow_date: true,
                    borrow_return: true,
                    borrow_status: true,
                    users_id_ref: {
                        select: {
                            users_fname: true,
                            users_sname: true,
                        },
                    },
                    borrow_address: true,
                    borrow_tel: true,
                    borrow_objective: true,
                    borrow_equipment_status: true,
                    borrow_create_date: true,
                    borrow_update_date: true,
                    borrowequipment_list: {
                        select: {
                            borrow_equipment_id: true,
                            borrow_equipment_status: true,
                            equipment_id: true, // ✅ ดึง equipment_id แทน borrow_equipment
                            equipment: { // ✅ ดึงข้อมูลอุปกรณ์ที่ถูกยืม
                                select: {
                                    equipment_name: true,
                                    equipment_code: true,
                                },
                            },
                        },
                    },
                    borrow_approver_ref: {
                        select: {
                            users_fname: true,
                            users_sname: true,
                        },
                    },
                    borrow_approver_date: true,
                    borrow_send_status: true,
                    borrow_send_date: true,
                    borrow_send_return: true,
                },
                orderBy: {
                    borrow_id: 'desc',
                },
            });

            return res.status(200).json({ message: 'Success', data: borrowequipment });

        } catch (error) {
            console.error("🚀 ~ handler ~ error:", error);
            return res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
};

export default authMiddleware(handler);
