
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import axios from "axios";
import prisma from '@/lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const marrystatus = await prisma.marrystatus.findMany()

            return res.status(200).json({ message: 'success', data: marrystatus })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }

    } else {
        res.setHeader('Allow', ['GET'])
        res.status(400).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
    }

}
