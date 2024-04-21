import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Container, Form, Tab, Tabs } from "react-bootstrap";
import Notif, { NotifRef } from "../components/Notif";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();

    const [loginForm, setLoginForm] = useState({
        username: "",
        password: "",
    })

    const [registerForm, setRegisterForm] = useState({
        username: "",
        password: "",
    })

    useEffect(() => {
        let token = localStorage.getItem('accessToken');
        // console.log('TOKEN:', token);

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.post(`http://localhost:8080/login/verify-token`).then(response => {
                // console.log(response.data);
                if (response.data && response.data.decoded) {
                    navigate('/home');
                }
            });
        }
    }, []);

    const handleLogin = (event: any) => {
        event.preventDefault();

        axios.post('http://localhost:8080/login/sign', loginForm).then(response => {
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                navigate("/home");
            }
        }).catch(error => {
            console.error(error);

            if (notifRef.current) {
                notifRef.current.openToast("Username ou mot de passe invalide");
            }
        });
    }

    const handleRegister = (event: any) => {
        event.preventDefault();


        axios.post('http://localhost:8080/login/register', registerForm).then(response => {
            console.log(response.data);
            if (response.data && response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                navigate("/home");
            }
        }).catch(error => {
            console.error(error);

            if (notifRef.current) {
                notifRef.current.openToast("Username ou mot de passe invalide");
            }
        });
    }

    const handleLoginFormChange = (event: any) => {
        const { name, value } = event.target;
        setLoginForm({ ...loginForm, [name]: value });
    };

    const handleRegisterFormChange = (event: any) => {
        const { name, value } = event.target;
        setRegisterForm({ ...registerForm, [name]: value });
    }

    const notifRef = useRef<NotifRef>(null); // Créer une référence pour le toast

    return (
        <Container className="w-full h-screen flex items-center justify-center">

            <Notif ref={notifRef} />


            <Card className="w-[500px] p-3">

                <Tabs
                    defaultActiveKey="login"
                    className="mb-3"
                >
                    <Tab eventKey="login" title="Connexion">
                        <Form onSubmit={handleLogin}>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Username"
                                    name="username"
                                    value={loginForm.username}
                                    onChange={handleLoginFormChange}
                                    autoComplete="username"
                                />
                            </Form.Group>
                            <Form.Group controlId="password" className="flex flex-col mt-2 mb-2">
                                <Form.Label>Mot de passe</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Mot de passe"
                                    name="password"
                                    value={loginForm.password}
                                    onChange={handleLoginFormChange}
                                    autoComplete="current-password"

                                />
                            </Form.Group>
                            <div className="w-full flex justify-end mt-5">
                                <Button variant="primary" type="submit">
                                    Connexion
                                </Button>
                            </div>
                        </Form>
                    </Tab>
                    <Tab eventKey="register" title="Inscription">

                        <Form onSubmit={handleRegister}>
                            <Form.Group controlId="registerUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Username"
                                    name="username"
                                    value={registerForm.username}
                                    onChange={handleRegisterFormChange}
                                    autoComplete="username"
                                />
                            </Form.Group>
                            <Form.Group controlId="registerPwd" className="flex flex-col mt-2 mb-2">
                                <Form.Label>Mot de passe</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Mot de passe"
                                    name="password"
                                    value={registerForm.password}
                                    onChange={handleRegisterFormChange}
                                    autoComplete="current-password"
                                />
                            </Form.Group>
                            <div className="w-full flex justify-end mt-5">
                                <Button variant="primary" type="submit">
                                    Inscription
                                </Button>
                            </div>
                        </Form>
                    </Tab>
                </Tabs>
            </Card>
        </Container>
    )
}