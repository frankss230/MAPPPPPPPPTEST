
import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import axios from "axios";
import prisma from '@/lib/prisma'

import { decrypt } from '@/utils/helpers'
import _ from 'lodash'
type Data = {
    message: string;
    data?: any;
}
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'GET'){
        try {
            const query      = req.query
            const takecareId = query.takecareId
            const usersId    = query.usersId
            const extenId    = query.extenId

            if(extenId){
                const extendedhelp = await prisma.extendedhelp.findFirst({
                    where: {
                        exten_id           : Number(extenId)
                    }
                })
                return res.status(200).json({ message: 'success', data: extendedhelp })
            }

            if(_.isNaN(Number(takecareId)) || _.isNaN(Number(usersId))){
                return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ takecareId หรือ usersId ไม่ใช่ตัวเลข' })
            }
           
            const extendedhelp = await prisma.extendedhelp.findFirst({
                where: {
                    takecare_id           : Number(takecareId),
                    user_id               : Number(usersId),
                    exten_received_user_id: null,
                    exten_received_date   : null,
                }
            })
            return res.status(200).json({ message: 'success', data: extendedhelp })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }
    }else if (req.method === 'POST') {
        try {

            if (req.body) {
                const body       = req.body
                const takecareId = Number(body.takecareId)
                const usersId    = Number(body.usersId)
                const typeStatus = body.typeStatus
                const safezLatitude = body.safezLatitude
                const safezLongitude = body.safezLongitude
                if(typeStatus === 'save' && takecareId && usersId && safezLatitude && safezLongitude){
                    if(_.isNaN(takecareId) || _.isNaN(usersId)){
                        return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ takecareId หรือ usersId ไม่ใช่ตัวเลข' })
                    }
                    
                      const createdextendedhelp =  await prisma.extendedhelp.create({
                            data: {
                                takecare_id    : takecareId,
                                user_id        : usersId,
                                exten_date     : new Date(),
                                exten_latitude : safezLatitude,
                                exten_longitude: safezLongitude,
                            },
                        })
                        return res.status(200).json({ message: 'success', id: createdextendedhelp.exten_id })
                }else{
                    return res.status(400).json({ message: 'error', data: 'ไม่สามารบันทึกได้' })
                }
                
            }
            return res.status(400).json({ message: 'error', data: 'error' })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }

    }if(req.method === 'PUT'){
        try {
            if (req.body) {
                const body = req.body
                const extenId = Number(body.extenId)
                const typeStatus = body.typeStatus
                const extenReceivedUserId = body.extenReceivedUserId
                const extenClosedUserId = body.extenClosedUserId
                if(_.isNaN(extenId) || !typeStatus){
                    return res.status(400).json({ message: 'error', data: 'พารามิเตอร์ ไม่ตรงกัน' })
                }
                let params = {}
                if(typeStatus === 'sendAgain'){
                    params = {
                        exten_date: new Date(),
                    }
                }else if(typeStatus === 'received'){
                    if(!extenReceivedUserId){
                        return res.status(400).json({ message: 'error', data: 'ไม่พบพารามิเตอร์ extenReceivedUserId' })
                    }
                    params = {
                        exten_received_user_id: Number(extenReceivedUserId),
                        exten_received_date: new Date(),
                    }
                }else if(typeStatus === 'close'){
                    if(!extenClosedUserId){
                        return res.status(400).json({ message: 'error', data: 'ไม่พบพารามิเตอร์ extenClosedUserId' })
                    }
                    params = {
                        exten_closed_user_id: Number(extenClosedUserId),
                        exted_closed_date: new Date(),
                    }
                }

                const updatedextendedhelp = await prisma.extendedhelp.update({
                    where: {
                        exten_id: extenId
                    },
                    data: params,
                })
                return res.status(200).json({ message: 'success', data: updatedextendedhelp})
            }
            return res.status(400).json({ message: 'error', data: 'error' })
        } catch (error) {
            return res.status(400).json({ message: 'error', data: error })
        }

    } else {
        res.setHeader('Allow', ['POST','GET'])
        res.status(400).json({ message: `วิธี ${req.method} ไม่อนุญาต` })
    }

}
