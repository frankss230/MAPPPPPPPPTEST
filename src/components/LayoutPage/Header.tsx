import React from 'react'

import { useRouter } from "next/router";
import Link from 'next/link'
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAuth } from '@/context/AuthContext';
interface Route {
    path: string;
    name: string;
    icon: string;
    permission: number[];
}

interface LayoutProps {
    routes: Route[];
}

const Header: React.FC<LayoutProps> = ({routes}) => {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user.user);

    const { login, logout } = useAuth();



    const brandText = () => {
        let text = 'Dashboard'
        routes.map((route:Route) => {
            if (router.route.indexOf(route.path) > -1) {
                text = route.name
            }
        })
        return text
    }

    return (
        <Navbar className="navbar-top navbar-dark nav-custom" expand="md">
            <Container fluid>
                <p className="m-0 text-white">
                    {brandText()}
                </p>

                <Nav className="d-none d-md-flex" navbar>
                    <Dropdown align="end" className="d-inline mx-2">
                        <Dropdown.Toggle id="dropdown-autoclose-true">
                            <i className="fas fa-user-circle"></i> {user.userName ? user.userName : 'User Name'}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Header>
                                <h6 className="text-overflow m-0">ยินดีต้อนรับ!</h6>
                            </Dropdown.Header>
                            {/* <Link href="/admin/profile">
                                <Dropdown.Item href="/admin/profile">
                                    <span>My Profile</span>
                                </Dropdown.Item>
                            </Link> */}
                            <Dropdown.Divider />
                            <Dropdown.Item href="#" onClick={(e) => logout()}>
                                <span className="text-danger">ออกจากระบบ</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default Header