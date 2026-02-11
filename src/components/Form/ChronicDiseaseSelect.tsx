import React, { useEffect, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import CreatableSelect from "react-select/creatable";
import { components, MenuListProps } from "react-select";

type Option = {
  label: string;
  value: string;
};

export type ChronicDiseaseSelectProps = {
  initialValue?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const STATIC_DISEASES: Option[] = [
  // --- 1. กลุ่ม NCDs (ต้องมีแน่นอน) ---
  { label: "เบาหวาน (Diabetes Mellitus)", value: "เบาหวาน" },
  { label: "ความดันโลหิตสูง (Hypertension)", value: "ความดันโลหิตสูง" },
  { label: "ไขมันในเลือดสูง (Dyslipidemia)", value: "ไขมันในเลือดสูง" },
  { label: "โรคอ้วน (Obesity)", value: "โรคอ้วน" },
  { label: "กรดยูริกในเลือดสูง (Hyperuricemia)", value: "กรดยูริกสูง" }, // มักมาคู่กับเก๊าท์ แต่แยกไว้ก็ได้

  // --- 2. หัวใจและหลอดเลือด ---
  { label: "หัวใจขาดเลือด/กล้ามเนื้อหัวใจตาย (IHD/CAD)", value: "หัวใจขาดเลือด" },
  { label: "หัวใจล้มเหลว (Heart Failure)", value: "หัวใจล้มเหลว" },
  { label: "หัวใจเต้นผิดจังหวะ (Arrhythmia)", value: "หัวใจเต้นผิดจังหวะ" },
  { label: "ลิ้นหัวใจรั่ว/ตีบ (Valvular Heart Disease)", value: "โรคลิ้นหัวใจ" },
  { label: "หลอดเลือดส่วนปลายตีบ (PAD)", value: "หลอดเลือดส่วนปลายตีบ" },

  // --- 3. ทางเดินหายใจ (ตัดหวัด/ปอดบวมออก) ---
  { label: "หอบหืด (Asthma)", value: "หอบหืด" },
  { label: "ถุงลมโป่งพอง (COPD)", value: "ถุงลมโป่งพอง" },
  { label: "ภูมิแพ้อากาศเรื้อรัง (Allergic Rhinitis)", value: "ภูมิแพ้อากาศ" },
  { label: "หยุดหายใจขณะหลับ (Sleep Apnea)", value: "หยุดหายใจขณะหลับ" }, // สำคัญ เพราะผลต่อหัวใจ
  { label: "พังผืดในปอด (Pulmonary Fibrosis)", value: "พังผืดในปอด" },

  // --- 4. สมองและระบบประสาท (ตัดไมเกรนได้ถ้าต้องการเน้นโรคหนัก แต่เก็บไว้เพราะพบบ่อย) ---
  { label: "หลอดเลือดสมอง/อัมพฤกษ์/อัมพาต (Stroke)", value: "หลอดเลือดสมอง" },
  { label: "ลมชัก (Epilepsy)", value: "ลมชัก" },
  { label: "พาร์กินสัน (Parkinson's)", value: "พาร์กินสัน" },
  { label: "อัลไซเมอร์/สมองเสื่อม (Dementia)", value: "สมองเสื่อม" },
  { label: "กล้ามเนื้ออ่อนแรง (MG/ALS)", value: "กล้ามเนื้ออ่อนแรง" },

  // --- 5. ทางเดินอาหารและตับ (ตัดโรคกระเพาะ/ท้องเสียออก) ---
  { label: "กรดไหลย้อน (GERD)", value: "กรดไหลย้อน" },
  { label: "ลำไส้อักเสบเรื้อรัง (IBD)", value: "ลำไส้อักเสบเรื้อรัง" }, // Crohn's / Ulcerative Colitis
  { label: "ตับอักเสบบี เรื้อรัง (Chronic Hepatitis B)", value: "ตับอักเสบบี" },
  { label: "ตับอักเสบซี เรื้อรัง (Chronic Hepatitis C)", value: "ตับอักเสบซี" },
  { label: "ตับแข็ง (Cirrhosis)", value: "ตับแข็ง" },

  // --- 6. ไต (ตัดนิ่ว/กระเพาะปัสสาวะอักเสบออก เพราะรักษาหายได้) ---
  { label: "โรคไตเรื้อรัง (CKD)", value: "โรคไตเรื้อรัง" },
  { label: "โปรตีนรั่วในปัสสาวะ (Nephrotic Syndrome)", value: "โปรตีนรั่วในปัสสาวะ" },

  // --- 7. กระดูกและข้อ (ตัดออฟฟิศซินโดรม/นิ้วล็อคออก) ---
  { label: "ข้อเข่าเสื่อม (Osteoarthritis)", value: "ข้อเข่าเสื่อม" },
  { label: "กระดูกพรุน (Osteoporosis)", value: "กระดูกพรุน" },
  { label: "เก๊าท์ (Gout)", value: "เก๊าท์" },
  { label: "รูมาตอยด์ (Rheumatoid Arthritis)", value: "รูมาตอยด์" },
  { label: "เอสแอลอี (SLE)", value: "เอสแอลอี" }, // ย้ายมาจากกลุ่มภูมิคุ้มกันให้หาง่ายขึ้น หรือไว้กลุ่มเดิมก็ได้

  // --- 8. ต่อมไร้ท่อและผิวหนังเรื้อรัง ---
  { label: "ไทรอยด์เป็นพิษ (Hyperthyroid)", value: "ไทรอยด์เป็นพิษ" },
  { label: "ไทรอยด์ต่ำ (Hypothyroid)", value: "ไทรอยด์ต่ำ" },
  { label: "สะเก็ดเงิน (Psoriasis)", value: "สะเก็ดเงิน" },

  // --- 9. สุขภาพจิต (เน้นกลุ่มต้องกินยาต่อเนื่อง) ---
  { label: "ซึมเศร้า (Depression)", value: "ซึมเศร้า" },
  { label: "ไบโพลาร์ (Bipolar)", value: "ไบโพลาร์" },
  { label: "วิตกกังวล/แพนิค (Anxiety/Panic)", value: "วิตกกังวล" },
  { label: "จิตเภท (Schizophrenia)", value: "จิตเภท" }, // เพิ่มเข้ามาเพราะสำคัญมากในกลุ่มยาจิตเวช

  // --- 10. เลือดและมะเร็ง ---
  { label: "ธาลัสซีเมีย (Thalassemia)", value: "ธาลัสซีเมีย" }, // ตัดโลหิตจางออก (เป็นแค่อาการ)
  { label: "โรคมะเร็ง (Cancer)", value: "มะเร็ง" }, // รวบเป็นข้อเดียว

  // --- 11. ตา (ตัดต้อกระจก/สายตาสั้นออก) ---
  { label: "ต้อหิน (Glaucoma)", value: "ต้อหิน" },

  // --- 12. อื่นๆ ที่สำคัญ ---
  { label: "HIV/AIDS", value: "HIV" },
  { label: "ถุงน้ำในรังไข่หลายใบ (PCOS)", value: "PCOS" },
  { label: "เยื่อบุโพรงมดลูกเจริญผิดที่ (Endometriosis)", value: "เยื่อบุโพรงมดลูกเจริญผิดที่" },
  { label: "อื่นๆ (โปรดระบุ)", value: "อื่นๆ" },
];

const parseInitialValue = (value?: string): Option[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => ({ label: item, value: item }));
};

const toCommaString = (options: Option[] | null): string => {
  if (!options || options.length === 0) return "";
  return options.map((opt) => opt.value).join(", ");
};

const mergeOptions = (base: Option[], extra: Option[]): Option[] => {
  const map = new Map<string, Option>();
  base.forEach((opt) => map.set(opt.value, opt));
  extra.forEach((opt) => {
    if (!map.has(opt.value)) {
      map.set(opt.value, opt);
    }
  });
  const list = Array.from(map.values());
  const otherIndex = list.findIndex((opt) => opt.value === "อื่นๆ");
  if (otherIndex > 0) {
    const [other] = list.splice(otherIndex, 1);
    list.unshift(other);
  }
  return list;
};

const STATIC_VALUES = new Set(STATIC_DISEASES.map((item) => item.value));

const ChronicDiseaseSelect: React.FC<ChronicDiseaseSelectProps> = ({
  initialValue,
  onChange,
  label = "โรคประจำตัว",
  placeholder = "กรอกโรคประจำตัว",
  disabled = false,
  className,
}) => {
  const initialSelected = useMemo(
    () => parseInitialValue(initialValue),
    [initialValue]
  );

  const [options, setOptions] = useState<Option[]>(
    mergeOptions(STATIC_DISEASES, initialSelected)
  );
  const [selected, setSelected] = useState<Option[]>(initialSelected);
  const [allowCustom, setAllowCustom] = useState(
    initialSelected.some((opt) => opt.value === "อื่นๆ")
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setSelected(initialSelected);
    setOptions((prev) => mergeOptions(prev, initialSelected));
    setAllowCustom(initialSelected.some((opt) => opt.value === "อื่นๆ"));
  }, [initialSelected]);

  const trimmedInput = inputValue.trim();
  const canCreate =
    allowCustom &&
    trimmedInput.length > 0 &&
    !options.some((opt) => opt.value === trimmedInput);

  const addCustomOption = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (options.some((opt) => opt.value === trimmed)) return;

    const newOption: Option = { label: trimmed, value: trimmed };
    const nextSelected = [
      ...selected.filter((opt) => opt.value !== "อื่นๆ"),
      newOption,
    ];

    setAllowCustom(true);
    setSelected(nextSelected);
    setOptions((prev) => mergeOptions(prev, [newOption]));
    onChange(toCommaString(nextSelected));
    setInputValue("");
  };
  return (
    <div className={className}>
      {label ? <Form.Label>{label}</Form.Label> : null}
      <CreatableSelect
        isMulti
        isSearchable
        isDisabled={disabled}
        value={selected}
        options={options}
        placeholder={placeholder}
        filterOption={(candidate, input) => {
          const term = input.trim();
          if (allowCustom) {
            if (STATIC_VALUES.has(candidate.value)) return false;
            if (!term) return true;
            return (
              candidate.label.includes(term) || candidate.value.includes(term)
            );
          }
          if (!term) return true;
          return candidate.label.includes(term) || candidate.value.includes(term);
        }}
        inputValue={inputValue}
        onInputChange={(value) => {
          setInputValue(value);
          return value;
        }}
        onCreateOption={(value) => {
          if (!allowCustom) return;
          addCustomOption(value);
        }}
        isValidNewOption={(inputValue, _, selectOptions) => {
          if (!allowCustom) return false;
          const trimmed = inputValue.trim();
          if (!trimmed) return false;
          return !selectOptions.some(
            (opt) => (opt as Option).value === trimmed
          );
        }}
        formatCreateLabel={(inputValue) =>
          `\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e42\u0e23\u0e04: "${inputValue.trim()}"`
        }
        formatOptionLabel={(option, { context }) => {
          if (option.value === "อื่นๆ") {
            return context === "menu" ? (
              <span className="btn btn-outline-secondary btn-sm">
                อื่นๆ
              </span>
            ) : (
              <span className="badge text-bg-secondary">อื่นๆ</span>
            );
          }
          return option.label;
        }}
        components={{
          MenuList: (props: MenuListProps<Option, true>) => (
            <components.MenuList {...props}>
              {props.children}
              {canCreate ? (
                <div className="border-top px-2 py-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addCustomOption(trimmedInput)}
                  >
                    {"\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19"}
                  </button>
                </div>
              ) : null}
            </components.MenuList>
          ),
        }}
        onChange={(newValue) => {
          const list = (newValue as Option[]) ?? [];
          const hasCustom = list.some(
            (opt) => !STATIC_VALUES.has(opt.value) && opt.value !== "อื่นๆ"
          );
          const nextAllowCustom =
            list.some((opt) => opt.value === "อื่นๆ") || hasCustom;

          const nextSelected =
            hasCustom && list.some((opt) => opt.value === "อื่นๆ")
              ? list.filter((opt) => opt.value !== "อื่นๆ")
              : list;

          const saveList = list.filter((opt) => opt.value !== "อื่นๆ");

          setAllowCustom(nextAllowCustom);
          setSelected(nextSelected);
          setOptions((prev) => mergeOptions(prev, list));
          onChange(toCommaString(saveList));
        }}
        styles={{
          control: (provided: any, state: any) => ({
            ...provided,
            borderColor: "#dee2e6",
            borderWidth: "1px",
            boxShadow: state.isFocused
              ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
              : "none",
            "&:hover": {
              borderColor: "#dee2e6",
            },
            minHeight: "38px",
            backgroundColor: disabled ? "#e9ecef" : "white",
          }),
          placeholder: (provided: any) => ({
            ...provided,
            color: "#6c757d",
          }),
          menu: (provided: any) => ({
            ...provided,
            zIndex: 9999,
          }),
          menuPortal: (provided: any) => ({
            ...provided,
            zIndex: 9999,
          }),
        }}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      />
      {allowCustom ? (
        <p className="mt-2 text-xs text-slate-500">
          {"\u0e2b\u0e32\u0e01\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e0a\u0e37\u0e48\u0e2d\u0e42\u0e23\u0e04\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e15\u0e31\u0e27\u0e43\u0e19\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23 \u0e42\u0e1b\u0e23\u0e14\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e0a\u0e37\u0e48\u0e2d\u0e42\u0e23\u0e04 \u0e41\u0e25\u0e49\u0e27\u0e01\u0e14\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19"}
        </p>
      ) : null}
    </div>
  );
};

export default ChronicDiseaseSelect;