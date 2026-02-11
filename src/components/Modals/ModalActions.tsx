import React, { Children, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import Modal from 'react-bootstrap/Modal';

import ButtonClose from '@/components/Button/ButtonClose';
import ButtonDefault from '@/components/Button/ButtonDefault';
import ButtonState from '@/components/Button/ButtonState';

interface ModalAlertProps {
    show: boolean;
    onHide: () => void;
    onClick: () => void;
    title: string;
    children?: React.ReactNode;
}

const ModalActions = ({ show, title, onHide, onClick, children }: ModalAlertProps) => {


    return (
        <>
            <Modal show={show} onHide={() => onHide()} centered>
                <Modal.Header className="py-2">
                    <p className="m-0">{title}</p>
                    <button type="button" className="btn" onClick={() => onHide()}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {children}
                </Modal.Body>
                <Modal.Footer className="py-1 border-0">
                    <ButtonState onClick={() => onClick()} text="บันทึก" icon="fas fa-save" />
                    <ButtonClose onClick={() => onHide()} />
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ModalActions