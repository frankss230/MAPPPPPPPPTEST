import React, { useState } from 'react'
import axios from 'axios'

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import InputLabel from '@/components/Form/InputLabel'
import ButtonState from '@/components/Button/ButtonState';

import styles from '@/styles/page.module.css'

function TestApi() {
    const [validated, setValidated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [resJson, setResJson] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const form = event.currentTarget;
            if (!form.checkValidity()) {
                return;
            }
            setLoading(true)
            const rews = await axios.get(`https://mso-api-adapter-dev-read-only.sobizsystem.com/api/v1/checkHelp/${form['idCard'].value}`, {
                headers: {
                    "X-API-KEY": "qv3wNKRrcxPkSyDTunL97h68dfj2JzQAasEBbYtW"
                }
            })
            setLoading(false)
            setResJson(JSON.stringify(rews.data))

        } catch (error) {
            setLoading(false)
            setValidated(true);
            event.stopPropagation();
        } finally {
            setLoading(false)
            setValidated(true);
            event.stopPropagation();
        }
    }

    return (
        <Container>
            <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)} className="pt-5">
                <Form.Group>
                    <InputLabel label="เลขบัตรประชาชน" id="idCard" required />
                </Form.Group>
                <Form.Group className="d-flex justify-content-center py-3">
                    <ButtonState type="submit" className={styles.button} text={'ส่งข้อมูล'} icon="fas fa-save" isLoading={isLoading} />
                </Form.Group>
            </Form>
            <div>
                <p> Response data </p>
                <p>{resJson}</p>
            </div>
        </Container>
    )
}

export default TestApi
//mjoko