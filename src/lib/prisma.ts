import { PrismaClient } from '@prisma/client';

declare const global: NodeJS.Global;

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}
// prisma.status.createMany({
//     data: [{
//         status_id: 1,
//         status_name: 'ผู้ดูแล',
//     },{
//         status_id: 2,
//         status_name: 'ผู้ดูแลสูงอายุ',
//     }],

// })
// prisma.gender.createMany({
//     data: [{
//         gender_id: 1,
//         gender_describe: 'ผู้ดูแล',
//     },{
//         gender_id: 2,
//         gender_describe: 'ผู้ดูแลสูงอายุ',
//     }],

// })

export default prisma;