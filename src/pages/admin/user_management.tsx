import React, { useEffect, useState, useCallback, useRef } from 'react'
import withAdminAuth from '@/hoc/withAdminAuth'
import LayoutPage from '@/components/LayoutPage'

import { Card, Container, Row, Form, Button, Table, Modal } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { getUsers, updateUserStatus } from '@/lib/service/userManagement'
import { openModalAlert } from '@/redux/features/modal'

import { handleAxiosError } from '@/lib/service/helpFunction';



const UserManagement = () => {
    
    const [validated, setValidated] = useState(false)
    const [show, setShow] = useState({ isShow: false, title: '', id: '' })
    const [usersList, setUsersList] = useState([])

    const setStatus = useRef<HTMLSelectElement>(null)
    const dispatch = useDispatch()

    useEffect(() => {
        getUsersList('')
    }, [])

    const getUsersList = useCallback(async (name: string) => {
        try {
          const res = await getUsers(name)
          setUsersList(res.data)
        } catch (error) {
            console.log("🚀 ~ getUsersList ~ error:", error)
            
        }
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        if (form.checkValidity() === false) {
            event.stopPropagation()
        } else {
            const name = (form['search-name'] as HTMLInputElement).value
            getUsersList(name)
        }
    }

    const handleClose = () => {
        setShow({ isShow: false, title: '', id: '' })
    }

    const handleSaveStatus = useCallback( async() => {
        try {
            if(setStatus.current && show){
                const status = setStatus.current.value
                if(status){
                    await updateUserStatus(Number(show.id), Number(status))
                    await getUsersList('')
                    handleClose()
                }
            }
        } catch (error) {
            dispatch(openModalAlert({ show: true, message: handleAxiosError(error) }));
        }
    }, [setStatus, show])

    return (
        <LayoutPage>
            <Container fluid>
                <Row className="py-3">
                    <Card className="card-stats card-dashboard shadow mb-4 mb-xl-0 p-0">
                        <Card.Header>
                            <Card.Title>ค้นหา</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={(e) => handleSubmit(e)} noValidate validated={validated} className="row p-2">
                                <Form.Group className="col">
                                    <Form.Label>ชื่อ-สกุล</Form.Label>
                                    <Form.Control type="text" placeholder="ชื่อ-สกุล" name="search-name" />
                                </Form.Group>
                                <Form.Group className="col d-flex align-items-end">
                                    <Button variant="primary" type="submit">
                                        ค้นหา
                                    </Button>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Row>
                <Row>
                    <Card className="card-stats card-dashboard shadow mb-4 mb-xl-0 p-0">
                        <Card.Header>
                            <p className="m-0">รายการบริหารจัดการผู้ใช้งาน</p>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th className="px-2">User ID</th>
                                        <th className="px-2">ชื่อ-สกุล</th>
                                        <th className="px-2">สิทธิ์การเข้าใช้งาน</th>
                                        <th className="px-2">สถานะผู้ใช้งาน</th>
                                        <th className="px-2">สถานะของบัญชีรายชื่อ</th>
                                        <th className="px-2">เครื่องมือ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        usersList.map((item: any, index: number) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="px-2">{item.users_id}</td>
                                                    <td className="px-2">{item.users_fname} {item.users_sname}</td>
                                                    <td className="px-2">{item.users_status_onweb === 1 ? 'มีสิทธิ์' : 'ไม่มีสิทธิ์'}</td>
                                                    <td className="px-2">{item.users_status_id.status_name}</td>
                                                    <td className="px-2">{item.users_status_active === 1 ? 'Actice' : 'Inactive'}</td>
                                                    <td className="px-2">
                                                        <Button variant="link" className="p-0 btn-edit" onClick={() => setShow({ isShow: true, title: `${item.users_fname} ${item.users_sname}`, id: item.users_id })}>
                                                            <i className="fas fa-edit"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Row>

                <Modal show={show.isShow} onHide={() => handleClose()}>
                    <Modal.Header closeButton>
                        <Modal.Title>{show.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group >
                            <Form.Label>เลือกสถานะ</Form.Label>
                            <Form.Select
                                name={'status'}
                                ref={setStatus}
                            >
                                <option value={''}>{'เลือกสถานะ'}</option>
                                <option value={1}>{'ผู้ดูแลผู้มีภาวะพึ่งพิง'}</option>
                                <option value={2}>{'เจ้าหน้าที่ อบต.'}</option>
                            </Form.Select>

                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose()}>
                            ปิด
                        </Button>
                        <Button variant="primary" onClick={() => handleSaveStatus()}>
                            บันทึก
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </LayoutPage>
    )
}

export default (UserManagement)