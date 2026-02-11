import React, { useEffect } from 'react'
import Modal from 'react-bootstrap/Modal';

interface Props {
    show: boolean;
    message: string;
    handleClose: () => void;
    showClose?: boolean;
    autoCloseMs?: number;
    messageClassName?: string;
}

const ModalAlert = ({ show, message, handleClose, showClose = true, autoCloseMs, messageClassName }: Props) => {
    useEffect(() => {
        if (!show || !autoCloseMs) return;
        const timer = setTimeout(() => handleClose(), autoCloseMs);
        return () => clearTimeout(timer);
    }, [show, autoCloseMs, handleClose]);

    return (
        <>
            <Modal show={show} centered onHide={() => handleClose()}>
                <Modal.Header className="py-2">
                    <h5 className="m-0">{'AFE +'}</h5>
                    {showClose && (
                        <button type="button" className="btn outline" style={{ fontSize: 20 }} onClick={() => handleClose()}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </Modal.Header>
                <Modal.Body>
                    <p className={messageClassName}>{message}</p>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ModalAlert
