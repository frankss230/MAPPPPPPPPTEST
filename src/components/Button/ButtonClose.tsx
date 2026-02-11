import React, { FC } from 'react'
import { useRouter } from "next/router";

interface Props {
    onClick: () => void;
}
const ButtonAdd: FC<Props> = (props) => {
    const { onClick } = props
    return (
        <button type="button" className="btn btn-3" onClick={() => onClick()}>
             ยกเลิก  <i className="fa-solid fa-xmark"></i>
        </button>
    )
}

export default ButtonAdd