import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

import LayoutPage from '@/components/LayoutPage'

import { Card, Container, Row, Form, Button, Table, Modal } from 'react-bootstrap'
import { getBorrowEquipmentList, updateBorrowEquipmentStatusSend } from '@/lib/service/borrowEquipment'
import { handleAxiosError } from '@/lib/service/helpFunction';
import { openModalAlert } from '@/redux/features/modal'
import moment from 'moment'

const SendQuestionnaire = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const dispatch = useDispatch()

    const [validated, setValidated] = useState(false)
    const [show, setShow] = useState({ isShow: false, title: '', body: '' })
    const [showQuestionnaire, setShowQuestionnaire] = useState({ isShow: false, title: '', body: '' })
    const [borrowEquipmentList, setBorrowEquipmentList] = useState<any[]>([])

    useEffect(() => {
        getBorrowEquipmentListData('', '', '')
    }, [])

    const getBorrowEquipmentListData = useCallback(async (name: string, name_borrow: string, status: string) => {
        try {
            const res = await getBorrowEquipmentList(name, name_borrow, status)
            if(res.data){
                setBorrowEquipmentList(res.data)
            }
        } catch (error) {
            console.log("🚀 ~ getUsersList ~ error:", error)

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
        await getBorrowEquipmentListData(form['name_user'].value, form['name_borrow'].value, '')
    }

    const handleClose = () => {
        setShow({ isShow: false, title: '', body: '' })
        setShowQuestionnaire({ isShow: false, title: '', body: '' })
    }

    const handleSend = useCallback( async (item: any) => {
        try {
            if (!user.userId) {
                return
            }
            const res = await updateBorrowEquipmentStatusSend(2, user.userId, item.borrow_id)
           
                await getBorrowEquipmentListData('', '', '')
            
            dispatch(openModalAlert({ show: true, message: 'ส่งแบบสอบถามสำเร็จ' }))
        } catch (error) {
            console.log("🚀 ~ handleSend ~ error:", error)
            dispatch(openModalAlert({ show: true, message: handleAxiosError(error) }))
        }
    }, [user])
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
                            <p className="m-0">รายการแบบสอบถาม</p>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th className="px-2">ลำดับ</th>
                                        <th className="px-2">ชื่อ-สกุล ของผู้ดูแลผู้มีภาวะพึ่งพิง</th>
                                        <th className="px-2">ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง</th>
                                        <th className="px-2">วันที่ส่งแบบสอบถาม</th>
                                        <th className="px-2">วันที่ตอบกลับ</th>
                                        <th className="px-2">แบบสอบถาม</th>
                                        <th className="px-2">สถานะ</th>
                                        <th className="px-2">เครื่องมือ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        borrowEquipmentList.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="px-2">{index + 1}</td>
                                                    <td className="px-2">{item.users_id_ref.users_fname + ' ' + item.users_id_ref.users_sname}</td>
                                                    <td className="px-2">{item.borrow_name}</td>
                                                    <td className="px-2">{item.borrow_send_date ? moment(item.borrow_send_date).format('DD-MM-YYYY') : ''}</td>
                                                    <td className="px-2">{item.borrow_send_return ? moment(item.borrow_send_return).format('DD-MM-YYYY') : ''}</td>
                                                    <td className="px-2">
                                                        <Button variant="link" className="p-0 btn-edit" onClick={() => setShowQuestionnaire({ isShow: true, title: item.name_borrow, body: '' })}>
                                                            <i className="fa-solid fa-file"></i>
                                                        </Button>
                                                    </td>
                                                    <td className="px-2">{item.borrow_send_status === 1 ? 'รอส่ง':( item.borrow_send_status === 2 ? <span className="alert-success">{'ส่งแล้ว'}</span>:'ส่งไม่สำเร็จ')}</td>
                                                    <td className="px-2">
                                                        <Button variant="link" className="p-0 btn-edit" onClick={() => handleSend(item)}>
                                                            <i className="fa-solid fa-share-from-square"></i>
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
                                    <td className="px-2">{'ตริณภร พิพัฒนกุล'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ชื่อ-สกุล ของผู้มีภาวะพึ่งพิง'}</td>
                                    <td className="px-2">{'นิชาภรณ์ สันติสุข'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'วันที่ขอ'}</td>
                                    <td className="px-2">{'2024-01-01'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'วันที่สินสุด'}</td>
                                    <td className="px-2">{'2024-12-31'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'สถานะ'}</td>
                                    <td className="px-2">{'อนุมัติ'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้อนุมัติ'}</td>
                                    <td className="px-2">{'นริศ ตรีทรัพย์'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้อนุมัติวันที่'}</td>
                                    <td className="px-2">{'2024-01-02'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ID เครื่อง'}</td>
                                    <td className="px-2">{'AASO00019238'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'วันที่คืน'}</td>
                                    <td className="px-2">{'2024-01-02'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'ผู้รับคืน'}</td>
                                    <td className="px-2">{'นริศ ตรีทรัพย์'}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group >
                            <Form.Label>เลือกสถานะ</Form.Label>
                            <Form.Select
                                name={'status'}
                                required
                            >
                                <option value={''}>{'เลือกสถานะ'}</option>
                                <option value={''}>{'อนุมัติ'}</option>
                                <option value={''}>{'ไม่อนุมัติ'}</option>
                            </Form.Select>

                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose()}>
                            ปิด
                        </Button>
                        <Button variant="primary" onClick={() => handleClose()}>
                            บันทึก
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showQuestionnaire.isShow} onHide={() => handleClose()} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{'แบบสอบถามการดูแลผู้มีภาวะพึ่งพิง'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>ตอนที่ 1 ข้อมูลทั่วไปของผู้มีภาวะพึ่งพิง</h5>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td className="px-2">{'1.เพศ'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'2.อายุ'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'3.สถานภาพสมรส'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'4.ลักษณะของครอบครัว'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'5.ระดับการศึกษา'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'6.รายได้'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'7.ท่านมีรายได้เพียงพอต่อค่าใช้จ่ายหรือไม่'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'8.ท่านมีโรคประจําตัว'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'9.รับประทานยา'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'10.การเข้าถึงระบบบริการสุขภาพ'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'11.การมีผู้ดูแลผู้มีภาวะพึ่งพิง'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'12.การเข้าร่วมกิจกรรม'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <h5>ตอนที่ 2 ความสามารถในการประกอบกิจวัตรประจำวัน</h5>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td className="px-2">{'1.รับประทานอาหารเมื่อเตรียมสํารับไว้ให้เรียบร้อยต่อหน้า '}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'2.การล้างหน้า หวีผม แปรงฟัน โกนหนวดในระยะเวลา 24–48 ชั่วโมงที่ผ่านมา'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'3.ลุกนั่งจากที่นอน หรือจากเตียงไปยังเก้าอี้'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'4.การใช้ห้องน้ำ'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'5.การเคลื่อนที่ภายในห้องหรือบ้าน '}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'6.การสวมใส่เสื้อผ้า'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'7.การขึ้นลงบันได 1 ชั้น'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'8.การอาบน้ำ'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'9.การกลั้นการถ่ายอุจจาระ ใน 1 สัปดาห์ที่ผ่านมา'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'10.	การกลั้นปัสสาวะในระยะ 1 สัปดาห์ที่ผ่านมา'}</td>
                                    <td className="px-2">{'-'}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose()}>
                            ปิด
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </LayoutPage>
    )
}

export default SendQuestionnaire