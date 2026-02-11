'use client'
import React, { useState } from 'react'
import Image from 'next/image';
import Container from 'react-bootstrap/Container';

import styles from '@/styles/page.module.css'

import Form from 'react-bootstrap/Form';

import InputLabel from '@/components/Form/InputLabel'
import ModalAlert from '@/components/Modals/ModalAlert'
import ButtonState from '@/components/Button/ButtonState';

const Connection = () => {
    const [validated, setValidated] = useState(false);
    const [alert, setAlert] = useState({show: false, message: ''});
    const [isLoading, setLoading] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      const form = event.currentTarget;
      setLoading(true)
      if (form.checkValidity() === false) {
        setAlert({show: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน'})
        event.preventDefault();
        event.stopPropagation();
        
      }else{
        setAlert({show: true, message: 'ระบบยังอยู่ในช่วงพัฒนา'})
        event.preventDefault();
        event.stopPropagation();
      }
      setTimeout(() => {
          setLoading(false)
      }, 2000);
      setValidated(true);
    };
    return (
        <Container>
            <div className={styles.main}>
                <Image src={'/images/Logo.png'} width={100} height={100} alt="Logo" priority />
                <h1 className="py-2">เชื่อมต่อนาฬิกา</h1>
            </div>
            <div className="px-5">
                <Form noValidate validated={validated} onSubmit={(e)=> handleSubmit(e)}>
                    <Form.Group>
                        <InputLabel label='ID' id='' defaultValue={1234} placeholder="กรอกชื่อผู้ใช้" disabled/>
                    </Form.Group>
                    <Form.Group>
                        <InputLabel label='PIN' id='' defaultValue={123456} placeholder="กรอกรหัสผ่าน" disabled />
                    </Form.Group>
                </Form>
            </div>
        </Container>
    )
}

export default Connection