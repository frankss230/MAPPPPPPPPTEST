import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'

import LayoutPage from '@/components/LayoutPage'
import { getBorrowEquipmentListReturn, updateBorrowEquipmentReturnStatus } from '@/lib/service/borrowEquipment'
import { openModalAlert } from '@/redux/features/modal'

import { Card, Container, Row, Form, Button, Table, Modal } from 'react-bootstrap'
import moment from 'moment'

const defaultShowState = {
    isShow: false,
    title: '',
    body: {
        borrow_id: 0,
        users_id_ref: {
            users_fname: '',
            users_sname: ''
        },
        borrow_name: '',
        borrow_date: '',
        borrow_return: '',
        borrow_equipment_status: 1,
        borrow_approver_ref: {
            users_fname: '',
            users_sname: ''
        },
        borrow_approver_date: '',
        borrow_return_date: '',
        borrow_return_user_ref:{
            users_fname: '',
            users_sname: ''
        },
        borrowequipment_list: []
    }
};

const ReturnEquipment = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch()

    const [validated, setValidated] = useState(false)
    const [show, setShow] = useState(defaultShowState)
    const [borrowEquipmentList, setBorrowEquipmentList] = useState([])

    const borrow_status = React.createRef<HTMLSelectElement>()

    useEffect(() => {
        getBorrowEquipmentListReturnData('', '', '')
    },[])   

    const getBorrowEquipmentListReturnData = useCallback(async (name: string, name_borrow: string, status: string) => {
        try {
            const response = await getBorrowEquipmentListReturn(name, name_borrow, status)
            if(response.data){
                setBorrowEquipmentList(response.data)
            }
        } catch (error) {
            console.log('error', error)
        }
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const form = event.currentTarget
        if (form.checkValidity() === false) {
            setValidated(true)
            return
        }
        await getBorrowEquipmentListReturnData(form['name_user'].value, form['name_borrow'].value, form['status'].value)
    }
    const handleClose = () => {
        setShow(defaultShowState)
    }

    const handleSaveBorrow = useCallback(async () => {
        try {
            const borrow_equipment_status_value = borrow_status.current?.value
            if (!borrow_equipment_status_value || !show.body.borrow_id || !user.userId) {
                return
            }
            await updateBorrowEquipmentReturnStatus(parseInt(borrow_equipment_status_value), user.userId, show.body.borrow_id)
            handleClose()
            dispatch(openModalAlert({ show: true, message: 'บันทึกสำเร็จ' }));
            await getBorrowEquipmentListReturnData('', '', '')
        } catch (error) {
            console.log("🚀 ~ handleSaveBorrow ~ error", error)
            dispatch(openModalAlert({ show: true, message: 'บันทึกไม่สำเร็จ' }));
        }
    }, [borrow_status, show, user])

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
                                    <Form.Label>ชื่อ-สกุล ของผู้ดูแลผู้มีภาวะพึ่งพิง</Form.Label>
                                    <Form.Control type="text" name="name_user" placeholder="ชื่อ-สกุล ของผู้ดูแลผู้มีภาวะพึ่งพิง" />
                                </Form.Group>
                                <Form.Group className="col">
                                    <Form.Label>ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง </Form.Label>
                                    <Form.Control type="text" name="name_borrow" placeholder="ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง" />
                                </Form.Group>
                                <Form.Group className="col">
                                    <Form.Label>สถานะ</Form.Label>
                                    <Form.Select
                                        name={'status'}
                                    >
                                        <option value={''}>{'เลือกสถานะ'}</option>
                                        <option value={'1'}>{'รอคืน'}</option>
                                        <option value={'2'}>{'คืนสำเร็จ'}</option>
                                        <option value={'3'}>{'ส่งคืนไม่สำเร็จ'}</option>
                                    </Form.Select>
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
                            <p className="m-0">รายการคืนครุภัณฑ์</p>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th className="px-2">ลำดับ</th>
                                        <th className="px-2">ชื่อ-สกุล ของผู้ดูแลผู้มีภาวะพึ่งพิง</th>
                                        <th className="px-2">ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง</th>
                                        {/* <th className="px-2">วันที่สิ้นสุด</th> */}
                                        <th className="px-2">สถานะ</th>
                                        <th className="px-2">เครื่องมือ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        borrowEquipmentList.map((item: any, index: number) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="px-2">{index + 1}</td>
                                                    <td className="px-2">{item.users_id_ref.users_fname} {item.users_id_ref.users_sname}</td>
                                                    <td className="px-2">{item.borrow_name}</td>
                                                    {/* <td className="px-2">{moment(item.borrow_return).format('DD-MM-YYYY')}</td> */}
                                                    <td className="px-2">{item.borrow_status === 1 ? 'รอคืน' : item.borrow_status === 2 ? <span className="alert-success">{'คืนสำเร็จ'}</span> : <span className="alert-danger">{'ส่งคืนไม่สำเร็จ'}</span>}</td>
                                                    <td className="px-2">
                                                        <Button variant="link" className="p-0 btn-edit" onClick={() => setShow({ isShow: true, title: item.borrow_name, body: item })}>
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

                <Modal show={show.isShow} onHide={() => handleClose()} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{show.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td className="px-2">{'ชื่อ-สกุล ของผู้ดูแลผู้มีภาวะพึ่งพิง'}</td>
                                    <td className="px-2">{show.body.users_id_ref.users_fname} {show.body.users_id_ref.users_sname}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง'}</td>
                                    <td className="px-2">{show.body.borrow_name}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'วันเดือนปีที่ยื่นคำขอ'}</td>
                                    <td className="px-2">{moment(show.body.borrow_date).format('DD-MM-YYYY')}</td>
                                </tr>
                                {/* <tr>
                                    <td className="px-2">{'วันที่สิ้นสุด'}</td>
                                    <td className="px-2">{moment(show.body.borrow_return).format('DD-MM-YYYY')}</td>
                                </tr> */}
                                <tr>
                                    <td className="px-2">{'สถานะ'}</td>
                                    <td className="px-2">{show.body.borrow_equipment_status === 1 ? 'รออนุมัติ' : (show.body.borrow_equipment_status === 2 ? <span className="alert-success">{'อนุมัติ'}</span> : <span className="alert-danger">{'ไม่อนุมัติ'}</span>)}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้อนุมัติ'}</td>
                                    <td className="px-2">{show.body.borrow_approver_ref?.users_fname} {show.body.borrow_approver_ref?.users_sname}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้อนุมัติวันที่'}</td>
                                    <td className="px-2">{show.body.borrow_approver_date ? moment(show.body.borrow_approver_date).format('DD-MM-YYYY') : ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'วันที่คืน'}</td>
                                    <td className="px-2">{show.body.borrow_return_date ? moment(show.body.borrow_return_date).format('DD-MM-YYYY') : ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้รับคืน'}</td>
                                    <td className="px-2">{show.body.borrow_return_user_ref?.users_fname} {show.body.borrow_return_user_ref?.users_sname}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group >
                            <Form.Label>เครื่องที่ยืม</Form.Label>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th className="px-2">ลำดับ</th>
                                        <th className="px-2">รายการ</th>
                                        <th className="px-2">ID เครื่อง</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        show.body.borrowequipment_list.map((item: any, index: number) => {
                                            return (
                                                <tr key={index}>
                <td className="px-2">{index + 1}</td>
                <td className="px-2">{item.equipment?.equipment_name || '-'}</td> {/* ✅ ดึงชื่ออุปกรณ์ */}
                <td className="px-2">{item.equipment?.equipment_code || '-'}</td> {/* ✅ ดึง ID อุปกรณ์ */}
            </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </Form.Group>
                        <Form.Group >
                            <Form.Label>เลือกสถานะ</Form.Label>
                            <Form.Select
                                name={'borrow_status'}
                                ref={borrow_status}
                            >
                                <option value={''}>{'เลือกสถานะ'}</option>
                                <option value={'1'}>{'รอคืน'}</option>
                                <option value={'2'}>{'คืน'}</option>
                                <option value={'3'}>{'คืนไม่สำเร็จ'}</option>
                            </Form.Select>

                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose()}>
                            ปิด
                        </Button>
                        <Button variant="primary" onClick={() => handleSaveBorrow()}>
                            บันทึก
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </LayoutPage>
    )
}

export default ReturnEquipment