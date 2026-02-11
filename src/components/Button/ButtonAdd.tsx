import React,{ FC } from 'react'
import { useRouter } from "next/router";

interface Props {
    onClick: () => void;
    title: string;
}
const ButtonAdd:FC<Props> = (props) => {
    const { title, onClick } = props
    return (
        <button
            className="btn-2 btn"
            type="button"
            onClick={() => onClick()}
        >
            {title}  <i className="fas fa-plus pr-2"></i>
        </button>
    )
}

export default ButtonAdd


//sdsdsds