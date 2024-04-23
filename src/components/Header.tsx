import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import './Header.css';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    onLogout: () => void; // Définissez le type de la fonction onLogout
    onSub?: () => void;
    onTask?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onSub, onTask }) => { // Utilisez React.FC pour définir les props et leur type

    const location = useLocation();
    let pathname;
    if (location.pathname) {
        pathname = location.pathname;
    }

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="p-3">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Brand href="/home">Task Manager</Navbar.Brand>
            <Navbar.Collapse id="basic-navbar-nav" className="justify-end">
                {pathname == '/subs'
                    ?
                    <Nav className="max-w-[300px]">
                        <Button variant="outline-light" onClick={onTask}>Tâches</Button>
                    </Nav>
                    :
                    <Nav className="max-w-[300px]">
                        <Button variant="outline-light" onClick={onSub}>Abonnement</Button>
                    </Nav>
                }
                <Nav className="max-w-[300px]">
                    <Button variant="outline-light" onClick={onLogout}>Déconnexion</Button>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;

export type { HeaderProps }
