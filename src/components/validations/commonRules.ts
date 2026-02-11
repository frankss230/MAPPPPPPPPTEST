import * as z from 'zod';

export const optionalDigitsRule = z
  .string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    const trimmed = val.trim();
    if (trimmed === '') return true;
    return /^[0-9]+$/.test(trimmed);
  }, 'ต้องเป็นตัวเลขเท่านั้น');
