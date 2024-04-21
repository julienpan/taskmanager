import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';

interface HeaderProps {
    onLogout: () => void; // Définissez le type de la fonction onLogout
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => { // Utilisez React.FC pour définir les props et leur type
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
