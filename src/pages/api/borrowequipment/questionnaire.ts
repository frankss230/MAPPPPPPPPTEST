
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import axios from "axios";
import prisma from '@/lib/prisma'
import { decrypt } from '@/utils/helpers'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // const id = req.query.id
            console.log('req.query.id ', req.query.id )
            const id = decrypt(req.query.id as string);
            console.log("🚀 ~ handle ~ id:", id)
            if(id){
                const borrow_id = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
                if (!isNaN(borrow_id)) {
                    const response = await prisma.borrowequipment.findFirst({
                        where: {
                            borrow_id: borrow_id
                        }
                    })
                    return res.status(200).json({ message: 'success', data: response })
                }
            }
            return res.status(400).json({ message: 'error', data: 'ไม่สามารถดึงข้อมูลได้' })
            
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }

    } else {
        res.setHeader('Allow', ['GET'])
        res.status(400).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
    }

}
