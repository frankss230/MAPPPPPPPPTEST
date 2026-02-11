import * as z from 'zod';
import { optionalDigitsRule } from './commonRules';

// --- 1. กฎพื้นฐาน ---
export const phoneRule = z
  .string({
    required_error: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
  })
  .min(1, "กรุณากรอกเบอร์โทรศัพท์มือถือ")
  .length(10, "เบอร์โทรศัพท์มือถือต้องมี 10 หลัก")
  .regex(/^[0-9]+$/, "ต้องเป็นตัวเลขเท่านั้น");

export const homePhoneRule = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    const trimmed = val.trim();
    if (trimmed === "") return true;
    return /^[0-9]+$/.test(trimmed);
  }, "ต้องเป็นตัวเลขเท่านั้น")
  .refine((val) => {
    if (!val) return true;
    const trimmed = val.trim();
    if (trimmed === "") return true;
    return trimmed.length === 10;
  }, "เบอร์โทรศัพท์บ้านต้องมี 10 หลัก");

export const zipCodeRule = z
  .string({
    required_error: "กรุณากรอกรหัสไปรษณีย์",
  })
  .min(1, "กรุณากรอกรหัสไปรษณีย์")
  .length(5, "รหัสไปรษณีย์ต้องมี 5 หลัก")
  .regex(/^[0-9]+$/, "ต้องเป็นตัวเลขเท่านั้น");

// --- 2. Schema สำหรับแก้ไขข้อมูลผู้ใช้ (ไม่มีรหัสผ่าน) ---
export const userEditSchema = z.object({
  users_fname: z.string({
    required_error: "กรุณากรอกชื่อ",
  }).min(1, "กรุณากรอกชื่อ"),
  
  users_sname: z.string({
    required_error: "กรุณากรอกนามสกุล",
  }).min(1, "กรุณากรอกนามสกุล"),
  
  users_pin: z.string({
    required_error: "กรุณากรอก PIN",
  })
    .min(1, "กรุณากรอก PIN")
    .length(4, "PIN ต้องมี 4 หลัก")
    .regex(/^[0-9]+$/, "ต้องเป็นตัวเลขเท่านั้น"),

  users_number: z.string().optional(),
  users_moo: optionalDigitsRule,
  users_road: z.string().optional(),
  
  users_tubon: z.string({
    required_error: "กรุณาเลือกตำบล",
  }).min(1, "กรุณาเลือกตำบล"),
  
  users_amphur: z.string({
    required_error: "กรุณาเลือกอำเภอ",
  }).min(1, "กรุณาเลือกอำเภอ"),
  
  users_province: z.string({
    required_error: "กรุณาเลือกจังหวัด",
  }).min(1, "กรุณาเลือกจังหวัด"),

  users_postcode: zipCodeRule, 
  users_tel1: phoneRule,
  users_tel_home: homePhoneRule,
});

// 3. Export Type
export type UserEditFormData = z.infer<typeof userEditSchema>;
