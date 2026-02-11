import * as z from 'zod';
import { optionalDigitsRule } from './commonRules';

// --- 1. กฎพื้นฐาน ---
export const phoneRule = z
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
  }, "เบอร์โทรศัพท์ต้องมี 10 หลัก");

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

// --- 2. Schema สำหรับลงทะเบียนผู้มีภาวะพึ่งพิง ---
export const elderlyRegistrationSchema = z.object({
  takecare_fname: z.string({
    required_error: "กรุณากรอกชื่อ",
  }).min(1, "กรุณากรอกชื่อ"),
  
  takecare_sname: z.string({
    required_error: "กรุณากรอกนามสกุล",
  }).min(1, "กรุณากรอกนามสกุล"),
  
  takecare_birthday: z.date({
    required_error: "กรุณาเลือกวันเกิด",
    invalid_type_error: "กรุณาเลือกวันเกิด",
  }),

  gender_id: z.number({
    required_error: "กรุณาเลือกเพศ",
    invalid_type_error: "กรุณาเลือกเพศ",
  }).min(1, "กรุณาเลือกเพศ"),

  marry_id: z.number({
    required_error: "กรุณาเลือกสถานะการสมรส",
    invalid_type_error: "กรุณาเลือกสถานะการสมรส",
  }).min(1, "กรุณาเลือกสถานะการสมรส"),

  takecare_number: z.string().optional(),
  takecare_moo: optionalDigitsRule,
  takecare_road: z.string().optional(),
  
  takecare_tubon: z.string({
    required_error: "กรุณาเลือกตำบล",
  }).min(1, "กรุณาเลือกตำบล"),
  
  takecare_amphur: z.string({
    required_error: "กรุณาเลือกอำเภอ",
  }).min(1, "กรุณาเลือกอำเภอ"),
  
  takecare_province: z.string({
    required_error: "กรุณาเลือกจังหวัด",
  }).min(1, "กรุณาเลือกจังหวัด"),

  takecare_postcode: zipCodeRule, 
  takecare_tel1: phoneRule,
  takecare_tel_home: homePhoneRule,

  takecare_disease: z.string().optional(),
  takecare_drug: z.string().optional(),
});

// 3. Export Type
export type ElderlyRegistrationFormData = z.infer<typeof elderlyRegistrationSchema>;
