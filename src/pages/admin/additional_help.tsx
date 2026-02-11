import React, { useCallback, useEffect, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDispatch } from 'react-redux'

import { Bar } from 'react-chartjs-2';

import LayoutPage from '@/components/LayoutPage'

import { Card, Container, Row, Form, Button, Table, Modal } from 'react-bootstrap'
import { getHelp } from '@/lib/service/additionalHelp'
import { openModalAlert } from '@/redux/features/modal'
import _ from 'lodash'
import moment from 'moment'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
interface IHelpData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}
const AdditionalHelp = () => {
    const dispatch = useDispatch()
    const [validated, setValidated] = useState(false)
    const [show, setShow] = useState({ isShow: false, title: '', body: '' })
    const [showQuestionnaire, setShowQuestionnaire] = useState({ isShow: false, title: '', body: '' })
    const [helpData, setHelpData] = useState<IHelpData | null>(null)

    useEffect(() => {
        getHelpData()
    }, [])

    const getHelpData = useCallback(async () => {
        try {
            const response = await getHelp()
            if (response.data) {
                const exten_date = _.groupBy(response.data, (item) => {
                   return moment(item.exten_date).format('M')
                })
                const exted_closed = _.groupBy(response.data, (item) => {
                    return moment(item.exted_closed_date).format('M') 
                })
                const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
                const data = {
                    labels,
                    datasets: [
                      {
                        label: 'ขอความช่วยเหลือ',
                        data: labels.map((res) => {
                            return exten_date[res] ? exten_date[res].length : 0
                        }),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      },
                      {
                        label: 'ช่วยเหลือสำเร็จ',
                        data: labels.map((res) => {
                            return exted_closed[res] ? exted_closed[res].length : 0
                        }),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                      },
                    ],
                  };
                  setHelpData(data)
            }
        } catch (error) {

            // dispatch(openModalAlert({ show: true, message: error }))
        }
    },[]) 

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
    }

    const handleClose = () => {
        setShow({ isShow: false, title: '', body: '' })
        setShowQuestionnaire({ isShow: false, title: '', body: '' })
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'สรุปข้อมูลช่วยเหลือ',
            },
        },
    }
   
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
                                    <Form.Label>วัน/เดือน/ปี เริ่มต้น </Form.Label>
                                    <Form.Control type="text" placeholder="วัน/เดือน/ปี เริ่มต้น " />
                                </Form.Group>
                                <Form.Group className="col">
                                    <Form.Label>วัน/เดือน/ปี สิ้นสุด</Form.Label>
                                    <Form.Control type="text" placeholder="วัน/เดือน/ปี สิ้นสุด" />
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
                <Row className="pb-3">
                    <Card className="card-stats card-dashboard shadow mb-4 mb-xl-0 p-0">
                        <Card.Body>
                            {
                                helpData ? <Bar options={options} data={helpData} /> : null
                            }
                            {/* <Bar options={options} data={data} /> */}
                        </Card.Body>
                    </Card>
                </Row>
                {/* <Row>
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
                                        <th className="px-2">วันที่ขอความช่วยเหลือ</th>
                                        <th className="px-2">วันที่ช่วยเหลือ</th>
                                        <th className="px-2">แบบสอบถาม</th>
                                        <th className="px-2">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-2">{1}</td>
                                        <td className="px-2">{'ตริณภร พิพัฒนกุล'}</td>
                                        <td className="px-2">{'กีรติ โพธิ์สำราญ'}</td>
                                        <td className="px-2">{'2024-01-01'}</td>
                                        <td className="px-2">{''}</td>
                                        <td className="px-2">{''}</td>
                                        <td className="px-2">{'รอการช่วยเหลือ'}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2">{2}</td>
                                        <td className="px-2">{'ธฤติพันธ์ กระจ่างวงศ์'}</td>
                                        <td className="px-2">{'นิชาภรณ์ สันติสุข'}</td>
                                        <td className="px-2">{'2024-01-01'}</td>
                                        <td className="px-2">{''}</td>
                                        <td className="px-2">{''}</td>
                                        <td className="px-2">{'รอการช่วยเหลือ'}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2">{3}</td>
                                        <td className="px-2">{'ภาวิดา หงษ์พัตรา'}</td>
                                        <td className="px-2">{'ธนเสฏฐ์ เกียรติบวรสกุล'}</td>
                                        <td className="px-2">{'2024-01-01'}</td>
                                        <td className="px-2">{'2024-02-01'}</td>
                                        <td className="px-2">
                                            <Button variant="link" className="p-0 btn-edit" onClick={() => setShowQuestionnaire({ isShow: true, title: 'กีรติ โพธิ์สำราญ', body: '' })}>
                                                <i className="fa-solid fa-file"></i>
                                            </Button>
                                        </td>
                                        <td className="px-2"><span className="alert-success">{'ช่วยเหลือแล้ว'}</span></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Row> */}

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
                                    <td className="px-2">{'หญิง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'2.อายุ'}</td>
                                    <td className="px-2">{'70'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'3.สถานภาพสมรส'}</td>
                                    <td className="px-2">{'สมรส'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'4.ลักษณะของครอบครัว'}</td>
                                    <td className="px-2">{'ครอบครัวเดี่ยว'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'5.ระดับการศึกษา'}</td>
                                    <td className="px-2">{'มัธยมศึกษา'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'6.รายได้'}</td>
                                    <td className="px-2">{'ตนเอง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'7.ท่านมีรายได้เพียงพอต่อค่าใช้จ่ายหรือไม่'}</td>
                                    <td className="px-2">{'ใช้จ่ายเพียงพอไม่มีหนี้สิน'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'8.ท่านมีโรคประจําตัว'}</td>
                                    <td className="px-2">{'ไม่มี'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'9.รับประทานยา'}</td>
                                    <td className="px-2">{'ไม่จําเป็นต้องรับประทานยา'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'10.การเข้าถึงระบบบริการสุขภาพ'}</td>
                                    <td className="px-2">{'สะดวกในการเข้าถึง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'11.การมีผู้ดูแลผู้มีภาวะพึ่งพิง'}</td>
                                    <td className="px-2">{'มีผู้ดูแล'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'12.การเข้าร่วมกิจกรรม'}</td>
                                    <td className="px-2">{'เป็นสมาชิกชมรมผู้มีภาวะพึ่งพิง และเข้าร่วมกิจกรรมไม่  สม่ำเสมอ (น้อยกว่า 8 ครั้งต่อปี)'}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <h5>ตอนที่ 2 ความสามารถในการประกอบกิจวัตรประจำวัน</h5>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td className="px-2">{'1.รับประทานอาหารเมื่อเตรียมสํารับไว้ให้เรียบร้อยต่อหน้า '}</td>
                                    <td className="px-2">{'1 คะแนน ตักอาหารเองได้ แต่ต้องมีคนช่วย เช่น ช่วยใช้ช้อนตักเตรียมไว้'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'2.การล้างหน้า หวีผม แปรงฟัน โกนหนวดในระยะเวลา 24–48 ชั่วโมงที่ผ่านมา'}</td>
                                    <td className="px-2">{'1 คะแนน ทําได้เอง (รวมทั้งที่ทําได้เองถ้าเตรียมอุปกรณ์ไว้ให้)'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'3.ลุกนั่งจากที่นอน หรือจากเตียงไปยังเก้าอี้'}</td>
                                    <td className="px-2">{'3 คะแนน ทําได้เอง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'4.การใช้ห้องน้ำ'}</td>
                                    <td className="px-2">{'2 คะแนน ช่วยเหลือตัวเองได้ดี (ขึ้นนั่งและลงจากโถส้วมเองได้ ทําความสะอาดได้เรียบร้อย หลังจากเสร็จธุระ	ถอดใส่เสื้อผ้าได้เรียบร้อย'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'5.การเคลื่อนที่ภายในห้องหรือบ้าน '}</td>
                                    <td className="px-2">{'3 คะแนน เดินหรือเคลื่อนที่ได้เอง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'6.การสวมใส่เสื้อผ้า'}</td>
                                    <td className="px-2">{'2 คะแนน ช่วยตัวเองได้ดี '}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'7.การขึ้นลงบันได 1 ชั้น'}</td>
                                    <td className="px-2">{'2 คะแนน ขึ้นลงได้เอง (ถ้าต้องใช้เครื่องช่วยเดิน เช่น Walker จะต้องเอาขึ้นลงได้ด้วย)'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'8.การอาบน้ำ'}</td>
                                    <td className="px-2">{'1 คะแนน อาบน้ำได้เอง'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'9.การกลั้นการถ่ายอุจจาระ ใน 1 สัปดาห์ที่ผ่านมา'}</td>
                                    <td className="px-2">{'2 คะแนน กลั้นได้เป็นปกติ'}</td>
                                </tr>
                                <tr>
                                    <td className="px-2">{'10.	การกลั้นปัสสาวะในระยะ 1 สัปดาห์ที่ผ่านมา'}</td>
                                    <td className="px-2">{'2 คะแนน กลั้นได้เป็นปกติ'}</td>
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

export default AdditionalHelp
//dvv