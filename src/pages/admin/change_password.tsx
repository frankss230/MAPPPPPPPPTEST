import React, { useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { resetPasswordAdmin } from '@/lib/service/auth'
import { openModalAlert } from '@/redux/features/modal'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store';

import LayoutPage from '@/components/LayoutPage'

import { handleAxiosError } from '@/lib/service/helpFunction';

interface ChangePasswordProps {
    user_id : number;
    old_password: string;
    new_password: string;
}

const ChangePassword = () => {
    const user = useSelector((state: RootState) => state.user.user);

    const dispatch = useDispatch()

    const [validated, setValidated] = useState(false)
    const [pending, setPending] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            setPending(true)
            const form = event.currentTarget;
            if (form.checkValidity() === false) {
                setValidated(true);
                setPending(false)
                return;
            }
            const old_password = form['old_password'].value;
            const new_password = form['new_password'].value;
            const check_new_password = form['check_new_password'].value;
            if(new_password !== check_new_password){
                throw 'รหัสใหม่ไม่ตรงกัน'
            }
            if(user && user.accessToken){
                const data: ChangePasswordProps = {
                    user_id: user.userId as number,
                    old_password,
                    new_password
                }
                await resetPasswordAdmin(user.accessToken, data);
                dispatch(openModalAlert({ show: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' }));
            }
            
            setPending(false);
            setValidated(true);
            
        } catch (error) {
            setPending(false);
            console.log('error', error)
            dispatch(openModalAlert({ show: true, message: handleAxiosError(error) }));
        }
    }

    return (
        <LayoutPage>
            <Container fluid>
                <Row className="py-3">
                    <Card className="card-stats card-dashboard shadow mb-4 mb-xl-0 p-0">
                        <Card.Header>
                            <Card.Title>เปลี่ยนรหัสผ่าน</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={(e) => handleSubmit(e)} noValidate validated={validated} className="row p-2">
                                <Row className="pb-2">
                                    <Form.Group className="col">
                                        <Form.Label>รหัสเดิม</Form.Label>
                                        <Form.Control required type="password" placeholder="รหัสเดิม" name="old_password" />
                                    </Form.Group>
                                </Row>
                                <Row  className="pb-2">
                                    <Form.Group className="col">
                                        <Form.Label>รหัสใหม่</Form.Label>
                                        <Form.Control required type="password" placeholder="รหัสใหม่" name="new_password" />
                                    </Form.Group>
                                </Row>
                                <Row  className="pb-2">
                                    <Form.Group className="col">
                                        <Form.Label>ยืนยันรหัสใหม่</Form.Label>
                                        <Form.Control required type="password" placeholder="ยืนยันรหัสใหม่"  name="check_new_password" />
                                    </Form.Group>
                                </Row>
                                <Row  className="pb-2">
                                    <Form.Group className="col d-flex">
                                        <Button variant="primary" type="submit">
                                        {pending ? <Spinner animation="border" variant="light" /> : 'ยืนยัน'}
                                        </Button>
                                    </Form.Group>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Row>
            </Container>
        </LayoutPage>
    )
}

export default ChangePassword