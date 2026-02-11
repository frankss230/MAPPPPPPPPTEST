import React from 'react'
import withAdminAuth from '@/hoc/withAdminAuth'
import LayoutPage from '@/components/LayoutPage'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'


const Dashboard = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return (
        <LayoutPage>
            <Container fluid>
                <Row className="py-3">
                    <Card className="card-stats card-dashboard shadow mb-4 mb-xl-0 p-0">
                        <Card.Header>
                            <Card.Title>หน้าหลัก</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h1>ยินดีต้อนรับ {user.userName || ''}</h1>
                        </Card.Body>
                    </Card>
                </Row>
            </Container>
        </LayoutPage>
    )
}

export default (Dashboard)