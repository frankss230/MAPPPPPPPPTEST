import React, { ChangeEvent, forwardRef } from 'react'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { sanitizeDigits } from '@/utils/inputSanitizers';

interface Props {
    onChange?: ((value: string | number) => void) | React.ChangeEventHandler<HTMLInputElement>;
    label: string;
    id: string;
    type?: string;
    defaultValue?: string | number;
    placeholder?: string;
    required?: boolean;
    icon?: any;
    disabled?: boolean;
    readOnly?: boolean; // 🔥 เพิ่ม readOnly
    max?: number;
    numericOnly?: boolean;
    // รับค่าสถานะ Error และ Success
    isInvalid?: boolean;
    errorMessage?: string;
    isValid?: boolean;

    [key: string]: any;
}

const InputLabel = forwardRef<HTMLInputElement, Props>((props, ref) => {
    const { 
        label, 
        id, 
        type = 'text', 
        defaultValue, 
        onChange, 
        placeholder = '', 
        required = false, 
        icon = null, 
        disabled = false, 
        readOnly = false, // 🔥 รับค่า readOnly
        max = null, 
        numericOnly = false,
        isInvalid = false, 
        errorMessage = '',
        isValid,
        ...rest 
    } = props

    let inputCustom = {}
    if (max) {
        inputCustom = {
            ...inputCustom,
            maxLength: max
        }
    }

    const numericAttrs: { inputMode?: 'numeric'; pattern?: string } = numericOnly
        ? { inputMode: 'numeric', pattern: '[0-9]*' }
        : {};

    return (
        <Form.Group className="mb-3">
            <Form.Label htmlFor={id}>
                {label} {required && <span className="text-danger">*</span>}
            </Form.Label>
            <InputGroup hasValidation>
                {icon && <InputGroup.Text>{icon}</InputGroup.Text>}
                <Form.Control
                    ref={ref}
                    className="mb-0"
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly} // 🔥 เพิ่ม readOnly
                    defaultValue={defaultValue}
                    
                    // ส่วนควบคุมสี: แดง (Invalid) / เขียว (Valid)
                    isInvalid={isInvalid}
                    isValid={isValid}

                    {...inputCustom}
                    {...numericAttrs}
                    {...rest}

                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (numericOnly) {
                            const sanitized = sanitizeDigits(e.target.value);
                            if (sanitized !== e.target.value) {
                                e.target.value = sanitized;
                            }
                        }
                        // ถ้ามี onChange จาก rest ให้ใช้ตัวนั้นก่อน
                        if (typeof rest.onChange === 'function') {
                            rest.onChange(e)
                            return
                        }

                        if (typeof onChange === 'function') {
                            // ถ้า onChange ถูกออกแบบมารับ event
                            if ((onChange as any).length === 1) {
                                try {
                                    (onChange as React.ChangeEventHandler<HTMLInputElement>)(e)
                                } catch {
                                    // fallback: รับ value
                                    (onChange as (val: string | number) => void)(e.target.value)
                                }
                            }
                        }
                    }}
                />
                <Form.Control.Feedback type="invalid">
                    {errorMessage}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
})

InputLabel.displayName = "InputLabel";
export default InputLabel
