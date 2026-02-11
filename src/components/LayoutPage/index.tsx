import React from 'react'

import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    slug?: string;
    titleBar?: string;
}
interface Route {
    path: string;
    name: string;
    icon: string;
    permission: number[];
}

const LayoutPage: React.FC<LayoutProps> = ({
    children
}) => {
    const routes:Route[] = [
         {
             path: "/admin/dashboard",
             name: "หน้าหลัก",
             icon: "fas fa-align-right",
             permission: [1, 2, 3]
         },
        {
            path: "/admin/change_password",
            name: 'เปลี่ยนรหัสผ่านสำหรับ รหัสผู้ใช้งาน "admin"',
            icon: "fas fa-align-right",
            permission: [1, 2, 3]
        },
        {
            path: "/admin/user_management",
            name: "บริหารจัดการผู้ใช้งาน",
            icon: "fas fa-align-right",
            permission: [1, 2, 3]
        },
        // {
        //     path:"/admin/check_equipment",
        //     name: "ตรวจสอบครุภัณฑ์",
        //     icon: "fas fa-align-right",
        //     permission: [1, 2, 3]
        // },
        {
            path: "/admin/borrow_equipment",
            name: "รายการยืมครุภัณฑ์",
            icon: "fas fa-align-right",
            permission: [1, 2, 3]
        },
        {
            path: "/admin/return_equipment",
            name: "รายการคืนครุภัณฑ์",
            icon: "fas fa-align-right",
            permission: [1, 2, 3]
        },
        // {
        //     path: "/admin/send_questionnaire",
        //     name: "ส่งลิงค์แบบสอบถาม",
        //     icon: "fas fa-align-right",
        //     permission: [1, 2, 3]
        // },
        {
            path: "/admin/additional_help",
            name: "รายการขอความช่วยเหลือเพิ่มเติม",
            icon: "fas fa-align-right",
            permission: [1, 2, 3]
        },
      
    ]
    return (
        <div>
            <Sidebar routes={routes} />
            <div className="main-content" >
                <Header routes={routes} />
                {children}
            </div>
        </div>
    )
}

export default LayoutPage