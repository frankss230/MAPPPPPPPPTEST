
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import axios from "axios";
import prisma from '@/lib/prisma'
import _ from "lodash";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const group_line_id = req.body.group_line_id
            const group_name = req.body.group_name || ''
            if(!_.isUndefined(group_line_id)  && !group_line_id){
                return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ group_line_id POST' })
            }
            const createGroupLine = await prisma.groupLine.create({
                data: {
                    group_line_id: group_line_id,
                    group_name   : group_name,
                    group_status : 1
                    
                }
            })

            return res.status(200).json({ message: 'success', id: createGroupLine.group_id })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }

    }else if(req.method === 'GET'){
        try {
            const group_line_id = req.query.group_line_id
            if(!_.isUndefined(group_line_id)  && !group_line_id){
                return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ group_line_id GET' })
            }
            const groupLine = await prisma.groupLine.findFirst({
                where: {
                    group_line_id: group_line_id as string,
                    group_status : 1
                }
            })

            return res.status(200).json({ message: 'success', data: groupLine })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }
    } else {
        res.setHeader('Allow', ['POST','GET'])
        res.status(400).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
    }

}
