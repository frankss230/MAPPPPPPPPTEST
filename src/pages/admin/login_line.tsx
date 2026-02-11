import React, { useState } from 'react'
import Link from 'next/link';

import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const LoginLine = () => {

    const [validated, setValidated] = useState(false);
    const [pending, setPending] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        setPending(true)
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setPending(false);
        setValidated(true);
    };


    return (
        <Container>
            <div className="row justify-content-center">
                <div className="col-4 mt-5">
                    <Card className="login">
                        <Card.Header as="h2" className="text-center">Login Line</Card.Header>
                        <Card.Body>
                            {/* {
                                isError &&
                                <Alert variant={'danger'}>
                                    {error.error}
                                </Alert>
                            } */}
                            <Form onSubmit={(e) => handleSubmit(e)} noValidate validated={validated} className="row p-2">
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>UUID</Form.Label>
                                    <Form.Control type="text" placeholder="UUID" name="uuid" required />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Code</Form.Label>
                                    <Form.Control type="text" placeholder="Code" name="code" required />
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary" type="submit" className="mt-3 w-100">
                                        {pending ? <Spinner animation="border" variant="light" /> : 'Submit'}
                                    </Button>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                        <Card.Footer className="text-muted">
                            <Link href="/admin/login">
                                <p className="mr-2 mb-0">Login Admin</p>
                            </Link>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
        </Container>
    )
}

export default LoginLine