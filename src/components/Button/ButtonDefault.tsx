import React,{ FC } from 'react'
import { useRouter } from "next/router";

interface Props {
    onClick: () => void;
    title: string;
    icon?: string;
}
const ButtonDefault:FC<Props> = (props) => {
    const { title, onClick, icon } = props
    return (
        <button
            className="btn-2"
            type="button"
            onClick={() => onClick()}
        >
          {icon && <i className={`${icon} pr-2`}></i>}{title}
        </button>
    )
}

export default ButtonDefault