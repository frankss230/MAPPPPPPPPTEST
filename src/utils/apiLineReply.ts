import axios from 'axios';
import moment from 'moment';
import prisma from '@/lib/prisma';
const WEB_API = process.env.WEB_API_URL;
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/reply';
const LINE_PUSH_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';
const LINE_PROFILE_API = 'https://api.line.me/v2/bot/profile';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN_LINE}`, // Replace with your LINE Channel Access Token
};

interface ReplyMessage {
    replyToken: string;
    message: string;
}
interface ReplyRegistration {
    replyToken: string;
    userId: string;
}
interface ReplyNotification {
    replyToken: string;
    message: string;
    groupLineId?: string | null;
}
interface ReplyFlexMessage {
    replyToken: string;
    altText: string;
    contents: any;
}
interface ReplyNotificationPostback {
    userId: number;
    takecarepersonId: number;
    type: string;
    message: string;
    replyToken: string;
}
interface ReplyNotificationPostbackTemp {
    userId: number;
    takecarepersonId: number;
    type: string;
    message: string;
    replyToken: string;
}
interface ReplyNotificationPostbackfall {
    userId: number;
    takecarepersonId: number;
    type: string;
    message: string;
    replyToken: string;
}
interface ReplyNotificationPostbackHeart {
    userId: number;
    takecarepersonId: number;
    type: string;
    message: string;
    replyToken: string;
}
interface ReplyUserData {
    replyToken: string;
    userData: {
        users_id: string;
        users_line_id: string;
        users_fname: string;
        users_sname: string;
        users_pin: string;
        users_number: string;
        users_moo: string;
        users_road: string;
        users_tubon: string;
        users_amphur: string;
        users_province: string;
        users_postcode: string;
        users_tel1: string;
        users_tel_home: string;
        users_status_id: {
            status_name: string;
        }
    };
    userTakecarepersonData?: any;
}
interface ReplySettingData {
    replyToken: string;
    userData: {
        users_id: string;
        users_line_id: string;
        users_fname: string;
        users_sname: string;
        users_pin: string;
        users_number: string;
        users_moo: string;
        users_road: string;
        users_tubon: string;
        users_amphur: string;
        users_province: string;
        users_postcode: string;
        users_tel1: string;
        users_tel_home: string;
        users_status_id: {
            status_name: string;
        }
    };
    userTakecarepersonData?: any;
    safezoneData?: any;
    temperatureSettingData?: any;
    heartrateSettingData?: any;
}
interface ReplyLocationData {
    replyToken: string;
    userData: {
        users_id: string;
        users_line_id: string;
        users_fname: string;
        users_sname: string;
        users_pin: string;
        users_number: string;
        users_moo: string;
        users_road: string;
        users_tubon: string;
        users_amphur: string;
        users_province: string;
        users_postcode: string;
        users_tel1: string;
        users_tel_home: string;
        users_status_id: {
            status_name: string;
        }
    };
    userTakecarepersonData?: any;
    safezoneData?: any;
    locationData?: any;
}
// helper ทำแถวแบบ baseline (label : value) และรองรับกำหนดสี value
const baseline = (label: string, value: string, valueColor?: string) => ({
    type: 'box',
    layout: 'baseline',
    contents: [
        { type: 'text', text: label, size: 'sm', color: '#555555', flex: 3, wrap: true },
        { type: 'text', text: value, size: 'sm', color: valueColor || '#111111', flex: 5, wrap: true }
    ]
});
const layoutBoxBaseline = (label: string, text: string, flex1 = 2, flex2 = 5) => {
    return {
        type: "box",
        layout: "baseline",
        contents: [
            {
                type: "text",
                text: label,
                flex: flex1,
                size: "sm",
                color: "#AAAAAA"
            },
            {
                type: "text",
                text: text,
                flex: flex2,
                size: "sm",
                color: "#666666",
                wrap: true
            }
        ]
    }
}

// การ์ด KPI สำหรับค่า Vital (ตัวเลขใหญ่ + หน่วย)
const kpiBox = (label: string, value: string, unit: string, color: string) => ({
    type: 'box',
    layout: 'vertical',
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingAll: '12px',
    spacing: '6px',
    alignItems: 'center',
    contents: [
        { type: 'text', text: label, size: 'xs', color: '#6B7280' },
        { type: 'text', text: value, size: '3xl', weight: 'bold', color },
        { type: 'text', text: unit, size: 'xs', color: '#6B7280' }
    ]
});

const SAFEZONE_STATUS_CONFIG: Record<number, { color: string; title: string; detail: string }> = {
    0: { color: '#22C55E', title: '✅ ปลอดภัยแล้ว', detail: 'กลับเข้าสู่เขตปลอดภัย' },
    1: { color: '#FFA500', title: '⚠️ แจ้งเตือนระดับ 1', detail: 'ออกนอกเขตปลอดภัยชั้นที่ 1' },
    3: { color: '#FF8800', title: '🟠 เฝ้าระวังระดับ 2', detail: 'กำลังเข้าใกล้ขอบเขตชั้นที่ 2' },
    2: { color: '#FF0000', title: '🚨 อันตรายสูงสุด!', detail: 'ออกนอกเขตปลอดภัยชั้นที่ 2' },
};

export const getFlexTemplate = (
    status: number,
    name: string,
    latitude: string,
    longitude: string,
    timeText: string,
    postbackData?: string
) => {
    const config = SAFEZONE_STATUS_CONFIG[status] || SAFEZONE_STATUS_CONFIG[2];
    const contents: any[] = [
        {
            type: 'text',
            text: config.detail,
            size: 'md',
            color: '#050505',
            wrap: true,
        },
        { type: 'separator', margin: 'md' },
        {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'sm',
            contents: [
                baseline('ชื่อผู้สูงอายุ', name),
                baseline('พิกัดปัจจุบัน', `${latitude}, ${longitude}`),
                baseline('เวลาแจ้งเตือน', timeText),
            ],
        },
    ];

    if (postbackData) {
        contents.push({
            type: 'button',
            style: 'primary',
            height: 'sm',
            margin: 'xxl',
            action: {
                type: 'postback',
                label: 'ส่งความช่วยเหลือเพิ่มเติม',
                data: postbackData,
            },
        });
    }

    return {
        type: 'bubble',
        header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: config.color,
            paddingAll: '12px',
            contents: [
                {
                    type: 'text',
                    text: config.title,
                    color: '#FFFFFF',
                    size: 'lg',
                    weight: 'bold',
                    wrap: true,
                },
            ],
        },
        body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents,
        },
    };
};

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

export const replyMessage = async ({
    replyToken,
    message
}: ReplyMessage) => {
    try {
        const requestData = {
            replyToken,
            messages: [
                {
                    type: 'text',
                    text: message,
                },
            ],
        };

        const response = await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const pushMessage = async ({
    replyToken,
    message
}: ReplyMessage) => {
    try {
        const requestData = {
            to: replyToken,
            messages: [
                {
                    type: 'text',
                    text: message,
                },
            ],
        };

        const response = await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyRegistration = async ({
    replyToken,
    userId
}: ReplyRegistration) => {
    try {
        const profile = await getUserProfile(userId);
        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "ลงทะเบียน",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "ลงทะเบียน",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "text",
                                    text: `คุณ ${profile.displayName}`,
                                    size: "sm",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ยืนยันลงทะเบียน",
                                        uri: `${WEB_API}/registration?auToken=${userId}`
                                    }
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotRegistration = async ({
    replyToken,
    userId
}: ReplyRegistration) => {
    try {
        const profile = await getUserProfile(userId);
        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "ลงทะเบียน",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "ลงทะเบียน",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "text",
                                    text: `คุณ ${profile.displayName} ยังไม่ได้ลงทะเบียน กรูณาลงทะเบียนก่อนเข้าใช้งาน`,
                                    size: "sm",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ยืนยันลงทะเบียน",
                                        uri: `${WEB_API}/registration?auToken=${userId}`
                                    }
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyMenuBorrowequipment = async ({
    replyToken,
    userData
}: ReplyUserData) => {
    try {
        const profile = await getUserProfile(userData.users_line_id);
        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "การยืม การคืนครุภัณฑ์",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "การยืม การคืนครุภัณฑ์",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "text",
                                    text: `คุณ ${profile.displayName}`,
                                    size: "sm",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "การยืมครุภัณฑ์",
                                        uri: `${WEB_API}/borrowequipment/borrow?auToken=${userData.users_line_id}`
                                    }
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    color: "#4477CE",
                                    action: {
                                        type: "uri",
                                        label: "การคืนครุภัณฑ์",
                                        uri: `${WEB_API}/borrowequipment/return_of?auToken=${userData.users_line_id}`
                                    }
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}
export const replyConnection = async ({
    replyToken,
    userData,
    userTakecarepersonData
}: ReplyUserData) => {
    try {
        const profile = await getUserProfile(userData.users_line_id);
        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "การเชื่อมต่อนาฬิกา",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "การเชื่อมต่อนาฬิกา",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "text",
                                    text: `คุณ ${profile.displayName}`,
                                    size: "sm",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "text",
                                    text: `ข้อมูลผู้ดูแล`,
                                    size: "md",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        layoutBoxBaseline("ชื่อ-สกุล", `${userData.users_fname} ${userData.users_sname}`, 4, 5),
                                        layoutBoxBaseline("เบอร์โทร", `${userData.users_tel1 || '-'}`, 4, 5),
                                    ]

                                },
                                {
                                    type: "text",
                                    text: `ข้อมูลผู้ที่มีภาวะพึ่งพิง`,
                                    size: "md",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        layoutBoxBaseline("ชื่อ-สกุล", `${userTakecarepersonData.takecare_fname} ${userTakecarepersonData.takecare_sname}`, 4, 5),
                                        layoutBoxBaseline("เบอร์โทร", `${userTakecarepersonData.takecare_tel1 || '-'}`, 4, 5),
                                    ]

                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        layoutBoxBaseline("ID", `${userData.users_id}`),
                                        layoutBoxBaseline("PIN", `${userData.users_pin}`),
                                    ]
                                },
                                // {
                                //     type  : "button",
                                //     style : "primary",
                                //     height: "sm",
                                //     margin: "xxl",
                                //     action: {
                                //         type : "uri",
                                //         label: "ตั้งค่าการเชื่อมต่อนาฬิกา",
                                //         uri  : `${WEB_API}/connection?auToken=${userData.users_line_id}`
                                //     }
                                // },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}
export const replyLocation = async ({
    replyToken,
    userData,
    safezoneData,
    userTakecarepersonData,
    locationData
}: ReplyLocationData) => {
    try {
        // 1) พิกัด
        let latitude = Number(safezoneData.safez_latitude);
        let longitude = Number(safezoneData.safez_longitude);
        if (locationData) {
            latitude = Number(locationData.locat_latitude);
            longitude = Number(locationData.locat_longitude);
        }

        // 2) ดึงค่า Temp/HR "ล่าสุด" (ไม่แสดงเวลา/คำว่าล่าสุด)
        const userIdNum = Number(userData.users_id);
        const takecareIdNum = Number(userTakecarepersonData.takecare_id);

        const [lastTemp, lastHR] = await Promise.all([
            prisma.temperature_records.findFirst({
                where: { users_id: userIdNum, takecare_id: takecareIdNum },
                orderBy: { record_date: 'desc' },
                select: { temperature_value: true, status: true }
            }),
            prisma.heartrate_records.findFirst({
                where: { users_id: userIdNum, takecare_id: takecareIdNum },
                orderBy: { record_date: 'desc' },
                select: { bpm: true, status: true }
            })
        ]);

        const tempVal = lastTemp ? Number(lastTemp.temperature_value).toFixed(1) : '—';
        const hrVal = lastHR ? String(Number(lastHR.bpm)) : '—';

        const tempColor = lastTemp?.status === 1 ? '#E11D48' : '#0EA5E9'; // แดงถ้าผิดปกติ, ฟ้าเมื่อปกติ
        const hrColor = lastHR?.status === 1 ? '#E11D48' : '#10B981';   // แดงถ้าผิดปกติ, เขียวเมื่อปกติ

        const requestData = {
            replyToken,
            messages: [
                // แผนที่ตำแหน่ง (ข้อความประเภท location เพิ่มอะไรไม่ได้)
                {
                    type: 'location',
                    title: `ตำแหน่งปัจจุบันของผู้ที่มีภาวะพึ่งพิง ${userTakecarepersonData.takecare_fname} ${userTakecarepersonData.takecare_sname}`,
                    address: 'สถานที่ตั้งปัจจุบันของผู้ที่มีภาวะพึ่งพิง',
                    latitude,
                    longitude
                },
                // Flex การ์ดรายละเอียด + Vitals ดีไซน์ใหม่
                {
                    type: 'flex',
                    altText: 'ข้อมูลตำแหน่งและสุขภาพ',
                    contents: {
                        type: 'bubble',
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            paddingAll: '16px',
                            spacing: '12px',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ตำแหน่งปัจจุบัน',
                                    color: '#111111',
                                    size: 'xl',
                                    weight: 'bold'
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    spacing: '6px',
                                    contents: [
                                        baseline('ชื่อ-สกุล', `${userTakecarepersonData.takecare_fname} ${userTakecarepersonData.takecare_sname}`),
                                        baseline('Latitude', String(latitude)),
                                        baseline('Longitude', String(longitude))
                                    ]
                                },
                                { type: 'separator', margin: 'md' },

                                // แถว KPI vitals (สวยและอ่านง่าย)
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    spacing: '12px',
                                    contents: [
                                        kpiBox('อุณหภูมิ', tempVal, '°C', tempColor),
                                        kpiBox('ชีพจร', hrVal, 'bpm', hrColor)
                                    ]
                                },

                                // ปุ่มต่าง ๆ
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    spacing: '10px',
                                    margin: 'lg',
                                    contents: [
                                        {
                                            type: 'button',
                                            style: 'primary',
                                            color: '#4477CE',
                                            height: 'sm',
                                            action: userTakecarepersonData.takecare_tel1 ? {
                                                type: 'uri',
                                                label: `โทร ${userTakecarepersonData.takecare_tel1}`,
                                                uri: `tel:${userTakecarepersonData.takecare_tel1}`
                                            }
                                                : {
                                                    type: 'message',
                                                    label: 'โทร',
                                                    text: 'ไม่มีข้อมูลเบอร์โทรศัพท์ของผู้มีภาวะพึ่งพิง'
                                                }
                                        },

                                        {
                                            type: 'button',
                                            style: 'primary',
                                            height: 'sm',
                                            action: {
                                                type: 'uri',
                                                label: 'ดูแผนที่จากระบบ',
                                                uri: `${WEB_API}/location?auToken=${userData.users_line_id}&idsafezone=${safezoneData.safezone_id}&idlocation=${locationData ? locationData.location_id : ''}`
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        };

        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) console.log(error.message);
    }
};

export const replySetting = async ({
    replyToken,
    userData,
    userTakecarepersonData,
    safezoneData,
    temperatureSettingData,
    heartrateSettingData
}: ReplySettingData & { temperatureSettingData?: any }) => {
    try {
        // ค่า default
        let r1 = 0;
        let r2 = 0;
        let idsafezone = 0;
        let maxTemperature = 0;
        let idSetting = 0;
        //let minBpm = 0;
        let maxBpm = 0;
        let idSettingHR = 0;

        if (safezoneData) {
            r1 = safezoneData.safez_radiuslv1 || 0;
            r2 = safezoneData.safez_radiuslv2 || 0;
            idsafezone = safezoneData.safezone_id || 0;
        }

        if (temperatureSettingData) {
            maxTemperature = temperatureSettingData.max_temperature || 37;
            idSetting = temperatureSettingData.setting_id || 0;
        }
        if (heartrateSettingData) {
            // minBpm = heartrateSettingData.min_bpm || 50;
            maxBpm = heartrateSettingData.max_bpm || 120;
            idSettingHR = heartrateSettingData.id || 0;
        }

        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "ตั้งค่าความปลอดภัย",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "ตั้งค่าความปลอดภัย",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                { type: "text", text: "ชื่อ", flex: 2, weight: "bold" },
                                                { type: "text", text: `${userTakecarepersonData.takecare_fname} ${userTakecarepersonData.takecare_sname}`, flex: 3, wrap: true }
                                            ]
                                        },
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                { type: "text", text: "รัศมี ชั้นที่ 1", flex: 2, weight: "bold" },
                                                { type: "text", text: `${r1} เมตร`, flex: 3 }
                                            ]
                                        },
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                { type: "text", text: "รัศมี ชั้นที่ 2", flex: 2, weight: "bold" },
                                                { type: "text", text: `${r2} เมตร`, flex: 3 }
                                            ]
                                        },
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                { type: "text", text: "อุณหภูมิ", flex: 2, weight: "bold" },
                                                { type: "text", text: `${maxTemperature} องศา`, flex: 3 }
                                            ]
                                        },
                                        {
                                            type: "box",
                                            layout: "baseline",
                                            contents: [
                                                { type: "text", text: "ชีพจร", flex: 2, weight: "bold" },
                                                { type: "text", text: `${maxBpm} ครั้งต่อนาที`, flex: 3 }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ตั้งค่าเขตปลอดภัย",
                                        uri: `${WEB_API}/setting?auToken=${userData.users_line_id}&idsafezone=${idsafezone}`
                                    }
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    color: "#4477CE",
                                    action: {
                                        type: "uri",
                                        label: "ตั้งค่าอุณหภูมิร่างกาย",
                                        uri: `${WEB_API}/settingTemp?auToken=${userData.users_line_id}&idsetting=${idSetting || ''}`
                                    }
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    color: "#60C4A9",
                                    action: {
                                        type: "uri",
                                        label: "ตั้งค่าชีพจร",
                                        uri: `${WEB_API}/settingHeartRate?auToken=${userData.users_line_id}&idsetting=${idSettingHR || ''}`
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        };

        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });

    } catch (error) {
        if (error instanceof Error) {
            console.error("replySetting error:", error.message);
        }
    }
};
export const replyUserInfo = async ({
    replyToken,
    userData,
    userTakecarepersonData
}: ReplyUserData) => {
    try {
        // const profile = await getUserProfile(userData.users_line_id);
        let contentTakecareperson = [
            layoutBoxBaseline("ข้อมูล", 'ยังไม่ได้เพิ่มข้อมูลผู้มีภาวะพึ่งพิง'),
        ]

        if (userTakecarepersonData) {
            contentTakecareperson = [
                layoutBoxBaseline("ชื่อ-สกุล", `${userTakecarepersonData.takecare_fname} ${userTakecarepersonData.takecare_sname}`, 4, 5),
                layoutBoxBaseline("วันเดือนปีเกิด", `${moment(userTakecarepersonData.takecare_birthday).format('DD/MM/YYYY')}`, 4, 5),
                layoutBoxBaseline("ที่อยู่", `${userTakecarepersonData.takecare_number || '-'} หมู่ ${userTakecarepersonData.takecare_moo || '-'}`, 4, 5),
                layoutBoxBaseline("ถนน", `${userTakecarepersonData.takecare_road || '-'}`, 4, 5),
                layoutBoxBaseline("ตำบล", `${userTakecarepersonData.takecare_tubon || '-'}`, 4, 5),
                layoutBoxBaseline("อำเภอ", `${userTakecarepersonData.takecare_amphur || '-'}`, 4, 5),
                layoutBoxBaseline("จังหวัด", `${userTakecarepersonData.takecare_province || '-'}`, 4, 5),
                layoutBoxBaseline("รหัสไปรษณีย์", `${userTakecarepersonData.takecare_postcode || '-'}`, 4, 5),
                layoutBoxBaseline("เบอร์โทรศัพท์มือถือ", `${userTakecarepersonData.takecare_tel1 || '-'}`, 4, 5),
                layoutBoxBaseline("เบอร์โทรศัพท์บ้าน", `${userTakecarepersonData.takecare_tel_home || '-'}`, 4, 5),
                layoutBoxBaseline("โรคประจำตัว", `${userTakecarepersonData.takecare_disease || '-'}`, 4, 5),
                layoutBoxBaseline("ยาที่ใช้ประจำ", `${userTakecarepersonData.takecare_drug || '-'}`, 4, 5),
            ]
        }

        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "ข้อมูลผู้ใช้งาน",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "ข้อมูลผู้ใช้งาน",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "text",
                                    text: `ข้อมูลผู้ดูแล`,
                                    size: "md",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },

                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        layoutBoxBaseline("ชื่อ-สกุล", `${userData.users_fname} ${userData.users_sname}`, 4, 5),
                                        layoutBoxBaseline("ที่อยู่", `${userData.users_number || '-'} หมู่ ${userData.users_moo || '-'}`, 4, 5),
                                        layoutBoxBaseline("ถนน", `${userData.users_road || '-'}`, 4, 5),
                                        layoutBoxBaseline("ตำบล", `${userData.users_tubon || '-'}`, 4, 5),
                                        layoutBoxBaseline("อำเภอ", `${userData.users_amphur || '-'}`, 4, 5),
                                        layoutBoxBaseline("จังหวัด", `${userData.users_province || '-'}`, 4, 5),
                                        layoutBoxBaseline("รหัสไปรษณีย์", `${userData.users_postcode || '-'}`, 4, 5),
                                        layoutBoxBaseline("เบอร์โทรศัพท์มือถือ", `${userData.users_tel1 || '-'}`, 4, 5),
                                        layoutBoxBaseline("เบอร์โทรศัพท์บ้าน", `${userData.users_tel_home || '-'}`, 4, 5),
                                    ]

                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "text",
                                    text: `ข้อมูลผู้ที่มีภาวะพึ่งพิง`,
                                    size: "md",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },

                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        ...contentTakecareperson
                                    ]

                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ตั้งค่าข้อมูลผู้ดูแล",
                                        uri: `${WEB_API}/userinfo/cuserinfo?auToken=${userData.users_line_id}`
                                    },

                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    color: "#4477CE",
                                    action: {
                                        type: "uri",
                                        label: "ตั้งค่าข้อมูลผู้มีภาวะพึ่งพิง",
                                        uri: userTakecarepersonData ? `${WEB_API}/userinfo/puserinfo?auToken=${userData.users_line_id}` : `${WEB_API}/elderly_registration?auToken=${userData.users_line_id}`
                                    }
                                }

                            ]
                        }
                    }
                }
            ],
        };

        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyUserData = async ({
    replyToken,
    userData
}: ReplyUserData) => {

    try {
        const profile = await getUserProfile(userData.users_line_id);
        const requestData = {
            replyToken,
            messages: [
                {
                    type: "flex",
                    altText: "ลงทะเบียน",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "ข้อมูลลงทะเบียน",
                                    color: "#FFB400",
                                    size: "xl",
                                    weight: "bold",
                                    wrap: true
                                },
                                {
                                    type: "text",
                                    text: `คุณ ${profile.displayName}`,
                                    size: "sm",
                                    color: "#555555",
                                    wrap: true,
                                    margin: "sm"
                                },
                                {
                                    type: "separator",
                                    margin: "xxl"
                                },
                                {
                                    type: "box",
                                    layout: "vertical",
                                    margin: "xxl",
                                    spacing: "sm",
                                    contents: [
                                        layoutBoxBaseline("ชื่อ", `${userData.users_fname} ${userData.users_sname}`),
                                        layoutBoxBaseline("Pin", userData.users_pin.toString()),
                                        layoutBoxBaseline("สถานะ", userData.users_status_id.status_name),
                                        layoutBoxBaseline("ที่อยู่", `${userData.users_number || '-'} หมู่ ${userData.users_moo || '-'}`),
                                        layoutBoxBaseline("ถนน", `${userData.users_road || '-'}`),
                                        layoutBoxBaseline("ตำบล", `${userData.users_tubon || '-'}`),
                                        layoutBoxBaseline("อำเภอ", `${userData.users_amphur || '-'}`),
                                        layoutBoxBaseline("จังหวัด", `${userData.users_province || '-'}`),
                                        layoutBoxBaseline("รหัสไปรษณีย์", `${userData.users_postcode || '-'}`),
                                        layoutBoxBaseline("เบอร์โทรศัพท์มือถือ", `${userData.users_tel1 || '-'}`),
                                        layoutBoxBaseline("เบอร์โทรศัพท์บ้าน", `${userData.users_tel_home || '-'}`),
                                        //layoutBoxBaseline("LINE ID", userData.users_line_id),
                                    ]

                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ลงทะเบียนผู้มีภาวะพึ่งพิง",
                                        uri: `${WEB_API}/elderly_registration?auToken=${userData.users_line_id}`
                                    }
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotification = async ({
    replyToken,
    message
}: ReplyNotification) => {
    try {
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
                                {
                                    type: "text",
                                    text: " ",
                                    align: "center",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งเตือนเขตปลอดภัย",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    align: "center",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotificationPostback = async ({
    userId,
    takecarepersonId,
    type,
    message,
    replyToken,

}: ReplyNotificationPostback) => {
    try {
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
                                {
                                    type: "text",
                                    text: " ",
                                    align: "center",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งเตือนเขตปลอดภัย",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    align: "center",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "postback",
                                        label: "ส่งความช่วยเหลือเพิ่มเติม",
                                        data: `userLineId=${replyToken}&takecarepersonId=${takecarepersonId}&type=${type}`,
                                    }
                                },
                                {
                                            type: 'button',
                                            color: "#1976D2",
                                            style: 'primary',
                                            height: 'sm',
                                            action: {
                                                type: 'uri',
                                                label: 'ดูแผนที่จากระบบ',
                                                //uri: `${WEB_API}/location?auToken=${userData.users_line_id}&idsafezone=${safezoneData.safezone_id}&idlocation=${locationData ? locationData.location_id : ''}`
                                            }
                                        },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "*หมาย: ข้าพเจ้ายินยอมเปิดเผยข้อมูลตำแหน่งปัจจุบันของผู้ที่มีภาวะพึ่งพิง",
                                            color: "#484848",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotificationSOS = async ({
    replyToken,
    message
}: ReplyNotification) => {
    try {

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
                                {
                                    type: "text",
                                    text: " ",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งเตือนฉุกเฉิน",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotificationSendDocQuery = async ({
    replyToken,
    userData
}: {
    replyToken: string;
    userData: any;
}) => {
    try {

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
                                {
                                    type: "text",
                                    text: " ",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แบบสอบถาม",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "กรุณาตอบแบบสอบถามเพื่อให้ข้อมูลที่ถูกต้อง",
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },

                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "uri",
                                        label: "ตอบแบบสอบถาม",
                                        uri: `${WEB_API}/questionnaire?id=${userData.borrow_id}`
                                    }
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}
export const replyNotificationPostbackTemp = async ({
    userId,
    takecarepersonId,
    type,
    message,
    replyToken,

}: ReplyNotificationPostbackTemp) => {
    try {
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
                                {
                                    type: "text",
                                    text: " ",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งอุณหภูมิร่างกายสูง",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "postback",
                                        label: "ส่งความช่วยเหลือเพิ่มเติม",
                                        data: `userLineId=${replyToken}&takecarepersonId=${takecarepersonId}&type=${type}`,
                                    }
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "*หมาย: ข้าพเจ้ายินยอมเปิดเผยข้อมูลตำแหน่งปัจจุบันของผู้ที่มีภาวะพึ่งพิง",
                                            color: "#FC0303",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}
export const replyNotificationPostbackfall = async ({
    userId,
    takecarepersonId,
    type,
    message,
    replyToken,

}: ReplyNotificationPostbackfall) => {
    try {
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
                                {
                                    type: "text",
                                    text: " ",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งเตือนการล้ม",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "postback",
                                        label: "ส่งความช่วยเหลือเพิ่มเติม",
                                        data: `userLineId=${replyToken}&takecarepersonId=${takecarepersonId}&type=${type}`,
                                    }
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "*หมาย: ข้าพเจ้ายินยอมเปิดเผยข้อมูลตำแหน่งปัจจุบันของผู้ที่มีภาวะพึ่งพิง",
                                            color: "#FC0303",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const replyNotificationPostbackHeart = async ({
    userId,
    takecarepersonId,
    type,
    message,
    replyToken,

}: ReplyNotificationPostbackHeart) => {
    try {
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
                                {
                                    type: "text",
                                    text: " ",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "แจ้งเตือนชีพจร",
                                            color: "#FC0303",
                                            size: "xl",
                                            weight: "bold",
                                            decoration: "none"
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xxl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "separator",
                                    margin: "md"
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: message,
                                            color: "#555555",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    margin: "xxl",
                                    action: {
                                        type: "postback",
                                        label: "ส่งความช่วยเหลือเพิ่มเติม",
                                        data: `userLineId=${replyToken}&takecarepersonId=${takecarepersonId}&type=${type}`,
                                    }
                                },
                                {
                                    type: "text",
                                    text: " ",
                                    wrap: true,
                                    lineSpacing: "5px",
                                    margin: "md",
                                    contents: [
                                        {
                                            type: "span",
                                            text: "*หมาย: ข้าพเจ้ายินยอมเปิดเผยข้อมูลตำแหน่งปัจจุบันของผู้ที่มีภาวะพึ่งพิง",
                                            color: "#FC0303",
                                            size: "md",
                                            // decoration: "none",
                                            // wrap      : true
                                        },
                                        {
                                            type: "span",
                                            text: " ",
                                            size: "xl",
                                            decoration: "none"
                                        }
                                    ]
                                },
                            ]
                        }
                    }
                }
            ],
        };
        await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}

export const pushFlexMessage = async ({
    replyToken,
    altText,
    contents
}: ReplyFlexMessage) => {
    try {
        const requestData = {
            to: replyToken,
            messages: [
                {
                    type: 'flex',
                    altText,
                    contents,
                },
            ],
        };

        const response = await axios.post(LINE_PUSH_MESSAGING_API, requestData, { headers: LINE_HEADER });
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
}
