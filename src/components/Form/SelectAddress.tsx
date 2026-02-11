import React from 'react';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';

interface AddressItem {
  id: number;
  name_th: string;
  name_en: string;
}

interface SelectAddressSearchableProps {
  label: string;
  id: string;
  value: string;
  options: AddressItem[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  isValid?: boolean;
  required?: boolean;
  getLabel: (item: AddressItem) => string;
}

const SelectAddressSearchable: React.FC<SelectAddressSearchableProps> = ({
  label,
  id,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "เลือก...",
  isInvalid = false,
  errorMessage,
  isValid = false,
  required = false,
  getLabel
}) => {
  // แปลง options เป็นรูปแบบที่ react-select ต้องการ
  const selectOptions = options.map(item => ({
    value: String(item.id),
    label: getLabel(item),
    data: item
  }));

  // หาค่าที่เลือกอยู่
  const selectedOption = selectOptions.find(opt => opt.value === value) || null;

  // Custom styles สำหรับ react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dee2e6',
      borderWidth: isInvalid || isValid ? '2px' : '1px',
      boxShadow: state.isFocused 
        ? isInvalid 
          ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)'
          : isValid
          ? '0 0 0 0.25rem rgba(25, 135, 84, 0.25)'
          : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
        : 'none',
      '&:hover': {
        borderColor: isInvalid ? '#dc3545' : isValid ? '#198754' : '#dee2e6',
      },
      minHeight: '38px',
      backgroundColor: disabled ? '#e9ecef' : 'white',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6c757d',
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Select
        inputId={id}
        value={selectedOption}
        onChange={(option: any) => onChange(option ? option.value : '')}
        options={selectOptions}
        isDisabled={disabled}
        placeholder={placeholder}
        styles={customStyles}
        isClearable={!required}
        isSearchable={true}
        noOptionsMessage={() => "ไม่พบข้อมูล"}
        loadingMessage={() => "กำลังโหลด..."}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      />
      {isInvalid && errorMessage && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {errorMessage}
        </div>
      )}
    </Form.Group>
  );
};

export default SelectAddressSearchable;