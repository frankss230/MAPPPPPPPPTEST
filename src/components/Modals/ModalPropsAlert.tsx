import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { closeModalAlert } from '@/redux/features/modal';
import Modal from 'react-bootstrap/Modal';

interface Props {
    show: boolean;
    message: string;
    handleClose: () => void;
}

const ModalPropsAlert = () => {
    const modalAlert = useSelector((state: RootState) => state.modal.alert);
    const dispatch  = useDispatch();
    const { show, message } = modalAlert;

    const handleClose = () => {
        dispatch(closeModalAlert());
        // dispatch({ type: 'MODAL_ALERT', payload: { show: false, message: '' } });
    }
    return (
        <>
            <Modal show={show} centered onHide={() => handleClose()}>
                <Modal.Header className="py-2">
                    <h5 className="m-0">{'AFE+'}</h5>
                    <button type="button" className="btn outline" style={{ fontSize: 20 }} onClick={() => handleClose()}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <p>{message}</p>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ModalPropsAlert