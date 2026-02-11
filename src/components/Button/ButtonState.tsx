import React from 'react'
import Button from 'react-bootstrap/Button';
interface Props {
    isLoading?: boolean;
    onClick?: () => void;
    type?:  "button" | "submit" | "reset" | undefined;
    text: string;
    icon?: string;
    className?: string;
}
function ButtonState({ isLoading = false, onClick = () => { }, type = 'button', text, icon, className }: Props) {
  return (
    <Button
      variant="primary"
      disabled={isLoading}
      onClick={() => onClick()}
      type={type}
      className={className}
    >
      {isLoading ? 'กำลังโหลด…' : icon ? <>{text}  <i className={icon}></i></>:`${text}`}
      
    </Button>
  )
}

export default ButtonState