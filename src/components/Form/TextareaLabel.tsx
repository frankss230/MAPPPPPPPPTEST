import React, { ChangeEvent, FC } from 'react'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

interface Props {
    onChange?: ((value: string | number) => void);
    label: string;
    id: string;
    type?: string;
    defaultValue?: string | number;
    placeholder?: string;
    required?: boolean;
    icon?: any;
}
const TextareaLabel: FC<Props> = (props) => {
    const { label, id, type = 'text', defaultValue = '', onChange = () => { }, placeholder = '', required = false, icon = null } = props
    return (
        <>
            <Form.Label htmlFor={id}>{label}</Form.Label>
            <InputGroup>
                {icon && <InputGroup.Text>{icon}</InputGroup.Text>}
                <Form.Control
                    className="mb-3"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    defaultValue={defaultValue}
                    type={type}
                    id={id}
                    placeholder={placeholder}
                    required={required}
                    as="textarea" 
                    rows={3}
                />
            </InputGroup>
        </>
    )
}

export default TextareaLabel