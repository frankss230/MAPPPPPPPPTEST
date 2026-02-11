import React, { FC, forwardRef, ForwardRefRenderFunction, useState } from 'react'
import DatePicker, { ReactDatePickerProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import _ from 'lodash';
interface CustomDatePickerProps extends ReactDatePickerProps { }
interface CustomInputProps {
    value: string;
    onClick: () => void;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
    ({ value, onClick }, ref) => (
        <button type="button" className="py-2 btn-date-picker" onClick={onClick} ref={ref}>
            <i className="fas fa-calendar-day"></i> {moment(new Date(value)).add(543, 'years').format('DD-MM-YYYY')}
        </button>
    )
);
CustomInput.displayName = 'CustomInput';
const DatePickerX: FC<CustomDatePickerProps> = (props) => {
    const years = _.range(
        Number(moment().format('YYYY')) - 100 + 543,
        Number(moment().format('YYYY')) + 5 + 543,
    1
    );
    const months = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
    ];
    return (
        <DatePicker
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }) => (
                <div
                   className="date-picker-header"
                >
              
                    <select
                        value={moment(date).year() + 543}
                        onChange={({ target: { value } }) =>
                            changeYear(Number(value) - 543)
                        }
                        className="header-year"
                        >
                        {years.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                    <select
                        value={months[moment(date).month()]}
                        onChange={({ target: { value } }) =>
                            changeMonth(months.indexOf(value))
                        }
                        className="header-month"
                    >
                        {months.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>

                </div>
            )}
            {...props} customInput = {React.createElement(CustomInput)} />
    )
}

export default DatePickerX