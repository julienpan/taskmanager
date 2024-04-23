import { useState, useEffect, MouseEventHandler, useRef } from "react";
import { Button, Col, Container, Form, InputGroup, Modal, Pagination, Row, Table } from "react-bootstrap";
import './Home.css';
import Notif, { NotifRef } from '../components/Notif';

import axiosService from "../services/axios.service";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale/fr';
import { format } from "date-fns";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
registerLocale('fr', fr)


enum DataStatus {
    PENDING = "PENDING",
    VALIDATED = "VALIDATED",
}

interface Data {
    id?: number;
    title?: string;
    creation_date: string;
    due_date: string;
    status?: DataStatus;
    validation_date: string;
    priority?: number;
    user_id?: number;
}


const Home: React.FC = () => {

    const navigate = useNavigate();

    const notifRef = useRef<NotifRef>(null); // Créer une référence pour le toast

    // Modal create
    const [show, setShow] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleClose = () => {
        setShow(false);
    }
    const handleShow = (element?: any) => {
        if (element) {
            setIsCreating(false);
            // Convertir la date UTC en objet Date
            const due_date = new Date(element.due_date);
            // Mettre à jour le formulaire avec les données de l'élément
            setFormData({
                ...element,
                dueDate: due_date,
            });
        } else {
            setIsCreating(true);
            setFormData({
                title: "",
                dueDate: new Date(),
                status: DataStatus.PENDING,
                priority: 1,
            })
        }
        setShow(true);
    }

    // Get data from API
    const [datas, setDatas] = useState<Data[]>([]);

    const [totalDataCount, setTotalDataCount] = useState(0);
    const [pageSize] = useState(10); // Taille de la page
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle

    // Fonction pour récupérer les données et le nombre total de données
    const fetchData = async (pageNumber?: any) => {
        try {
            // Récupérer les données
            let query;
            if (pageNumber) {
                query = `/data/get?page=${pageNumber}`;
            } else {
                query = `/data/get`;
            }

            let data: any;

            await axiosService.get(query).then(response => {
                data = response.data;
                console.log(data);
            });

            if (data) {
                setDatas(data.data);
                setTotalDataCount(data.totalDataCount);
            }
        } catch (error) {
            console.log('Erreur lors de la récupération des données:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // Déterminer si la pagination est nécessaire
    const isPaginationNeeded = totalDataCount > pageSize;
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalDataCount / pageSize);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber); // Mettre à jour la page actuelle    
        // Appeler votre fonction fetchData avec la nouvelle page actuelle
        fetchData(pageNumber);
    };

    let items = [];

    for (let number = 1; number <= totalPages; number++) {
        items.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                {number}
            </Pagination.Item>
        );
    }

    // FORM
    const today = new Date();

    const [formData, setFormData]: any = useState({
        title: "",
        dueDate: new Date(),
        status: DataStatus.PENDING,
        priority: 1,
    });

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleDelete = () => {
        if (!formData.id) {
            console.log("ID de la tâche manquant dans formData");
            return;
        }

        axiosService.delete(`/data/delete/${formData.id}`, formData.id).then(response => {
            console.log('Tâche supprimée avec succès: ', response.data);
            fetchData();
            handleClose();
            if (notifRef.current) {
                notifRef.current.openToast("Tâche supprimée avec succès");
            }
        }).catch(error => {
            console.log('Erreur lors de la suppression de la tâche:', error);
            handleClose();
        })
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (isCreating) {
            axiosService.post('/data/create', formData).then((res) => {
                if (notifRef.current) {
                    notifRef.current.openToast("Tâche créee avec succès");
                }
                handleClose();
                fetchData();
            }).catch(error => {
                console.log('Error:', error);
                if (notifRef.current) {
                    notifRef.current.openToast("Impossible de crée la tâche");
                }
            })
        } else {

            if (!formData.id) {
                console.log("ID de la tâche manquant dans formData");
                return;
            }

            axiosService.put(`/data/modify/${formData.id}`, formData).then(response => {
                console.log('Tâche mise à jour avec succès: ', response.data);
                if (notifRef.current) {
                    notifRef.current.openToast("Tâche mise à jour avec succès");
                }
                handleClose();
                fetchData();
            }).catch(error => {
                console.log('Erreur lors de la mise à jour de la tâche:', error);
                if (notifRef.current) {
                    notifRef.current.openToast("Erreur lors de la mise à jour de la tâche");
                }
                handleClose();
            })
        }
    };

    const [searchForm, setSearchForm] = useState<any>({
        title: "",
        user_id: 0,
    });

    const handleSearch = (value: any, type?: string) => {
        let updatedSearchForm = { ...searchForm }; // Copie de l'état actuel
        if (type === 'title') {
            updatedSearchForm.title = value.toLowerCase();
            setSearchForm({ ...searchForm, title: value });
        } else if (type === 'id') {
            updatedSearchForm.user_id = parseInt(value);
            setSearchForm({ ...searchForm, user_id: value });
        }

        if (updatedSearchForm.title) {
            updatedSearchForm.title = updatedSearchForm.title.toLowerCase();
        }
        console.log(updatedSearchForm);

        // Utiliser la valeur mise à jour pour déterminer si la recherche doit être effectuée
        if ((updatedSearchForm.title.trim().length > 0 || (updatedSearchForm.user_id != 0 && !Number.isNaN(updatedSearchForm.user_id)))) {
            console.log('Search');
            axiosService.post(`/data/search`, { searchForm: updatedSearchForm }).then(response => {
                console.log(response.data);
                setDatas(response.data);
            }).catch(error => {
                console.log('Erreur lors de la recherche:', error);
            });
        } else {
            console.log('Fetch');
            fetchData();
        }
    }



    const handleLogout = async () => {
        await localStorage.removeItem('accessToken');

        navigate('/login');
    }

    const handleSub = () => {
        navigate('/subs');
    }

    return (
        <>
            <Header onLogout={handleLogout} onSub={handleSub} />
            <Container fluid className="pl-5 pr-5 lg:pl-28 lg:pr-28">
                <Notif ref={notifRef} />
                <Row className="text-center mt-5 mb-2">
                    <div className="text-2xl">Liste des tâches</div>
                </Row>
                <Row className="mt-5 mb-5 text-center">
                    <Col>
                        <InputGroup>
                            <Form.Text className="flex items-center w-[150px]">Recherche par titre</Form.Text>
                            <Form.Control
                                className="max-w-[300px]"
                                placeholder="Titre"
                                aria-label="Titre"
                                value={searchForm.title}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleSearch(value, "title");
                                }}
                            />
                        </InputGroup>

                        <InputGroup className="mt-2">
                            <Form.Text className="flex items-center w-[150px]">Identifiant</Form.Text>
                            <Form.Control className="max-w-[300px]" min="0" type="number" placeholder="id" aria-label="id" value={searchForm.user_id} onChange={(e) => {
                                if (e) {
                                    console.log(e.target.value);
                                    const value = e.target.value;
                                    handleSearch(value, "id");
                                }
                            }} />
                        </InputGroup>
                    </Col>
                    <Col>

                        <Button onClick={() => handleShow()}>Créer une tâche</Button>
                    </Col>
                </Row>
                <Row className="flex justify-center">
                    <Col sm="10">
                        <Table striped bordered hover data-testid="custom-table">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Date de création</th>
                                    <th>Date d'échéance</th>
                                    <th>Statut</th>
                                    <th>Date de validation</th>
                                    <th>Priorité</th>
                                    <th>Crée par</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datas.map(element => (
                                    <tr key={element.id} onClick={() => handleShow(element)} className={element.status == "VALIDATED" ? "bg-custom" : ""}>
                                        <td>{element.title}</td>
                                        <td>{format(new Date(element.creation_date), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>{format(new Date(element.due_date), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>{element.status}</td>
                                        <td>{element.validation_date ? format(new Date(element.validation_date), 'dd/MM/yyyy HH:mm') : ""}</td>
                                        <td>{element.priority}</td>
                                        <td>{element.user_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>

                <div className="fixed bottom-5 left-1/2 -translate-x-1/2">
                    <Pagination className="flex justify-center">{items}</Pagination>
                </div>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isCreating ? "Création d'une tâche" : "Modification d'une tâche"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="title">
                                <Form.Label>Titre</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Titre de la tâche"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="dueDate" className="flex flex-col mt-2 mb-2">
                                <Form.Label>Date d'échéance</Form.Label>
                                <DatePicker
                                    selected={formData.dueDate ? new Date(formData.dueDate) : null}
                                    onChange={(date: any) => setFormData({ ...formData, dueDate: date ? date : null })}
                                    minDate={new Date()} // Date minimale (aujourd'hui)
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Date de rendu"
                                    className="form-control"
                                    excludeDates={[today]}
                                />

                            </Form.Group>
                            <Form.Group controlId="status">
                                <Form.Label>Statut</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="PENDING">En attente</option>
                                    <option value="VALIDATED">Validé</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="priority">
                                <Form.Label>Niveau de priorité</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <div className="w-full flex justify-end mt-2">
                                {!isCreating ? <div>
                                    <Button variant="danger" onClick={handleDelete} className="mr-2">
                                        Supprimer
                                    </Button>
                                </div> : ""}
                                <div>
                                    <Button variant="primary" type="submit">
                                        {isCreating ? "Créer" : "Modifier"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container >
        </>
    )
}

export default Home;