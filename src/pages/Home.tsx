import { useState, useEffect } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";

enum DataStatus {
    PENDING = "En attente",
    VALIDATED = "Validé",
}

interface Data {
    title: string;
    creationDate: string;
    dueDate: string;
    status: DataStatus,
    validationDate: string,
}

export default function Home() {
    const [datas, setDatas] = useState<Data[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/getData')
            .then(response => response.json())
            .then(data => {
                setDatas(data); 
            })
            .catch(error => console.error('Erreur lors de la récupération des données:', error));
    }, []);

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Date de création</th>
                                <th>Date d'échéance</th>
                                <th>Statut</th>
                                <th>Date de validation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map(element => (
                                <tr key={element.title}>
                                    <td>{element.title}</td>
                                    <td>{element.creationDate}</td>
                                    <td>{element.dueDate}</td>
                                    <td>{element.status}</td>
                                    <td>{element.validationDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Button className="fixed left-1/2 bottom-[20px] transform -translate-x-1/2 -translate-y-1/2">Créer une tâche</Button>
        </Container>
    )
}
