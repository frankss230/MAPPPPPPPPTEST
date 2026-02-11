import axios from 'axios';
import moment from 'moment';
import prisma from '@/lib/prisma'

const WEB_API = process.env.WEB_API_URL;
const LINE_INFO_API = 'https://api.line.me/v2/bot/info';
const LINE_GROUP_API = 'https://api.line.me/v2/bot/group/'
const LINE_PUSH_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';
const LINE_PROFILE_API = 'https://api.line.me/v2/bot/profile';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN_LINE}`,
};

interface ReplyNotification {
    resUser          : {
        users_related_borrow: string;
        users_fname         : string;
        users_sname         : string;
        users_tel1          : string;
        users_line_id       : string;
    };
    resTakecareperson: {
        takecare_fname: string;
        takecare_sname: string;
        takecare_tel1 : string;
        takecare_id   : number;
    };
    resSafezone      : {
        safezone_id?: number;
    };
    extendedHelpId   : number;
    locationData : {
        location_id?   : number;
        locat_latitude : string;
        locat_longitude: string;
    };
}

interface ReplyNoti {
    replyToken : string;
    message    : string;
    userIdAccept: string;
    buttons?: ReplyNotiButton[];
}

interface ReplyNotiButton {
    label: string;
    type: "postback" | "uri" | "message";
    data?: string;
    uri?: string;
    text?: string;
}

export const getUserProfile = async (userId: string) => {
    try {
        const response = await axios.get(`${LINE_PROFILE_API}/${userId}`, { headers: LINE_HEADER });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

const layoutBoxBaseline = (label: string, text: string, flex1 = 2, flex2 = 5) => {
    return {
        type: "box",
        layout: "baseline",
        contents: [
            {
                type: "text",
                text: label || "ไม่ระบุ",
                flex: flex1,
                size: "sm",
                color: "#AAAAAA"
            },
            {
                type: "text",
                text: text || "-",
                flex: flex2,
                size: "sm",
                color: "#666666",
                wrap: true
            }
        ]
    }
}

const header1 = () => {
    const h1 = {
        type: "text",
        text: "แจ้งเตือนช่วยเหลือเพิ่มเติม",
        contents: [
            {
                type: "span",
                text: "แจ้งเตือนช่วยเหลือเพิ่มเติม",
                color: "#FC0303",
                size: "xl",
                weight: "bold",
                decoration: "none"
            }
        ]
    }
    const h2 = {
        type: "separator",
        margin: "md"
    }
    return [h1, h2]
}

export const replyNotification = async ({
    resUser,
    resTakecareperson,
    resSafezone,
    extendedHelpId,
    locationData,
}: ReplyNotification) => {
    try {
        const latitude = Number(locationData.locat_latitude);
        const longitude = Number(locationData.locat_longitude);
        const safezoneId = Number(resSafezone?.safezone_id || 0);
        const locationId = Number(locationData?.location_id || 0);
        const mapUri = `${WEB_API}/location?auToken=${resUser.users_line_id}&idsafezone=${safezoneId}&idlocation=${locationId}`;

        // ค้นหากลุ่มที่เปิดใช้งานจากฐานข้อมูล
        const groupLine = await prisma.groupLine.findFirst({
            where: {
                group_status: 1,
            },
        });

        if (groupLine) {
            const groupLineId = groupLine.group_line_id;

            // ตรวจสอบและทำความสะอาดข้อมูลก่อนส่ง
            const userFullName = `${resUser.users_fname || ''} ${resUser.users_sname || ''}`.trim() || 'ไม่ระบุชื่อ';
            const userTel = resUser.users_tel1 || '-';
            const takecareFullName = `${resTakecareperson.takecare_fname || ''} ${resTakecareperson.takecare_sname || ''}`.trim() || 'ไม่ระบุชื่อ';
            const takecareTel = resTakecareperson.takecare_tel1 || '-';

            const requestData = {
                to: groupLineId,
                messages: [
                    {
                        type: 'location',
                        title: `ตำแหน่งปัจจุบันของผู้มีภาวะพึ่งพิง ${takecareFullName}`,
                        address: 'สถานที่ตั้งปัจจุบันของผู้มีภาวะพึ่งพิง',
                        latitude: latitude,
                        longitude: longitude,
                    },
                    {
                        type: 'flex',
                        altText: 'แจ้งเตือน',
                        contents: {
                            type: 'bubble',
                            body: {
                                type: 'box',
                                layout: 'vertical',
                                contents: [
                                    header1()[0],
                                    header1()[1],
                                    {
                                        type: 'text',
                                        text: 'ข้อมูลผู้ดูแล',
                                        size: 'md',
                                        color: '#555555',
                                        wrap: true,
                                        margin: 'sm',
                                    },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        margin: 'xxl',
                                        spacing: 'sm',
                                        contents: [
                                            layoutBoxBaseline('ชื่อ-สกุล', userFullName, 4, 5),
                                            layoutBoxBaseline('เบอร์โทร', userTel, 4, 5),
                                        ],
                                    },
                                    {
                                        type: 'separator',
                                        margin: 'xxl',
                                    },
                                    {
                                        type: 'text',
                                        text: 'ข้อมูลผู้มีภาวะพึ่งพิง',
                                        size: 'md',
                                        color: '#555555',
                                        wrap: true,
                                        margin: 'sm',
                                    },
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        margin: 'xxl',
                                        spacing: 'sm',
                                        contents: [
                                            layoutBoxBaseline('ชื่อ-สกุล', takecareFullName, 4, 5),
                                            layoutBoxBaseline('เบอร์โทร', takecareTel, 4, 5),
                                        ],
                                    },
                                    {
                                        type: 'button',
                                        style: 'primary',
                                        height: 'sm',
                                        margin: 'xxl',
                                        action: {
                                            type: 'postback',
                                            label: 'ตอบรับเคสช่วยเหลือ',
                                            data: `type=accept&takecareId=${resTakecareperson.takecare_id}&extenId=${extendedHelpId}&userLineId=${resUser.users_line_id}`,
                                        },
                                    },
                                    {
                                        type: 'button',
                                        style: 'primary',
                                        height: 'sm',
                                        margin: 'md',
                                        color: '#1D4ED8',
                                        action: {
                                            type: 'uri',
                                            label: 'ดูแผนที่',
                                            uri: mapUri,
                                        },
                                    },
                                    {
                                        type: 'button',
                                        style: 'primary',
                                        height: 'sm',
                                        margin: 'xxl',
                                        color: '#f10000',
                                        action: {
                                            type: 'uri',
                                            label: 'โทรหาผู้ดูแล',
                                            uri: `tel:${resUser.users_tel1 || '0000000000'}`
                                        },
                                    },
                                    {
                                        type: 'button',
                                        style: 'primary',
                                        height: 'sm',
                                        margin: 'xxl',
                                        color: '#f10000',
                                        action: resTakecareperson.takecare_tel1
                                            ? {
                                                type: 'uri',
                                                label: 'โทรหาผู้มีภาวะพึ่งพิง',
                                                uri: `tel:${resTakecareperson.takecare_tel1}`
                                            }
                                            : {
                                                type: 'message',
                                                label: 'โทรหาผู้มีภาวะพึ่งพิง',
                                                text: 'ไม่มีข้อมูลเบอร์โทรศัพท์ของผู้มีภาวะพึ่งพิง'
                                            }
                                    }
                                ],
                            },
                        },
                    },
                ],
            };

            // ส่งข้อความไปยังกลุ่ม
            await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
            console.log('✅ Notification sent successfully to group:', groupLineId);
        } else {
            console.log('❌ ไม่พบกลุ่มไลน์ที่ต้องการส่งข้อความไป');
        }
    } catch (error: any) {
        console.log("❌ LINE ERROR", error?.response?.status, error?.response?.data, error?.message);
        throw error;
    }
};

export const replyNoti = async ({
    replyToken,
    userIdAccept,
    message,
    buttons = [],
}: ReplyNoti) => {
    try {
        const profile = await getUserProfile(userIdAccept);
        const displayName = profile?.displayName || 'ผู้ใช้งาน';
        const messageText = message || 'ไม่มีข้อความ';

        const requestData = {
            to: replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "แจ้งเตือน",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                header1()[0],
                                header1()[1],
                                {
                                    type: "text",
                                    text: `คุณ ${displayName}`,
                                    wrap: true,
                                    margin: "md",
                                    color: "#555555",
                                    size: "md"
                                },
                                {
                                    type: "text",
                                    text: messageText,
                                    wrap: true,
                                    margin: "md",
                                    color: "#555555",
                                    size: "md"
                                },
                                ...buttons.map((b) => ({
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "md",
                                    action:
                                        b.type === "postback"
                                            ? { type: "postback", label: b.label, data: b.data || "" }
                                            : b.type === "uri"
                                                ? { type: "uri", label: b.label, uri: b.uri || "" }
                                                : { type: "message", label: b.label, text: b.text || "" },
                                })),
                            ]
                        }
                    }
                }
            ],
        };

        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
        console.log('✅ Reply notification sent successfully to:', replyToken);
    } catch (error: any) {
        console.log("❌ REPLY NOTI ERROR", error?.response?.status, error?.response?.data, error?.message);
        throw error;
    }
}
