
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserProfile } from '@/utils/apiLineReply';
type Data = {
	message: string;
	data?: any;
}
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		const id = req.query.id
		const profile = await getUserProfile(id as string)
		return res.status(200).json({ message: 'success', data: profile })
	} else {
		res.setHeader('Allow', ['GET'])
		res.status(405).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
	}

}
