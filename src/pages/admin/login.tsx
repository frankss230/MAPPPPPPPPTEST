import React, { useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { openModalAlert } from '@/redux/features/modal';
import { RootState, AppDispatch } from '@/redux/store';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const Login = () => {
    const { login, logout } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [validated, setValidated] = useState(false);
    const [pending, setPending] = useState(false);

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
            const username = form['username'].value;
            const password = form['password'].value;

            console.log("Username:", username);
            console.log("Password:", password);
            
            await login(username, password);
            //  logout();
            
            setPending(false);
            setValidated(true);
            
        } catch (error) {
            setPending(false);
            console.log('error', error)
            dispatch(openModalAlert({ show: true, message: error as string }));
        }
    };


    return (
        <Container>
            <div className="row justify-content-center">
                <div className="col-4 mt-5">
                    <Card className="login">
                        <Card.Header as="h2" className="text-center">Login Admin</Card.Header>
                        <Card.Body>
                            {/* {
                                isError &&
                                <Alert variant={'danger'}>
                                    {error.error}
                                </Alert>
                            } */}
                            <Form onSubmit={(e) => handleSubmit(e)} noValidate validated={validated} className="row p-2">
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" placeholder="Username" name="username" required />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" name="password" required />
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary" type="submit" className="mt-3 w-100">
                                        {pending ? <Spinner animation="border" variant="light" /> : 'Submit'}
                                    </Button>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        {/* <Card.Footer className="text-muted">
                            <Link href="/admin/login_line">
                                <p className="mr-2 mb-0">Login Line</p>
                            </Link>
                        </Card.Footer> */}
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default Login