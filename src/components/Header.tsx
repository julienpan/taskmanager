import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';

const Header = ({ onLogout }: any) => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="p-3">
            <Navbar.Brand href="/home">Task Manager</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-end">
                <Nav className="mt-0 md:mt-5">
                    <Button variant="outline-light" onClick={onLogout}>Déconnexion</Button>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
