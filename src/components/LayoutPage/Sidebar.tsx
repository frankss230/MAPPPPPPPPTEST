import React from 'react'
import { useRouter } from "next/router";
import Link from 'next/link'
import { Nav, Navbar, Container, Image } from 'react-bootstrap'
interface Route {
    path: string;
    name: string;
    icon: string;
    permission: number[];
}

interface LayoutProps {
    routes: Route[];
}

const Sidebar: React.FC<LayoutProps> = ({routes}) => {

    const router = useRouter();

    const createLinks = () => {
        if(!routes){
            return null
        }
        return routes.map((route:Route, index:number) => {
           const active = router.route.indexOf(route.path) > -1;
            return (
                <Nav.Link key={index} href={route.path} active={active} >{route.name}</Nav.Link>
            )
        })
    }

    return (
        <Navbar
            className="navbar-vertical fixed-left navbar-light bg-white" expand="md"
        >
            <Container>
                <Navbar.Brand className="pt-0">
                    <Image src={'/images/Logo.png'} width={200} height={200} alt="Logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="m-0">
                        {createLinks()}
                    </Nav>
                </Navbar.Collapse>
                <p>V 0.0.1</p>
            </Container>

        </Navbar>
    )
}

export default Sidebar