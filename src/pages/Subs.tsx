import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Card, Button, Container } from "react-bootstrap";
import './Subs.css';

declare global { namespace JSX { interface IntrinsicElements { ['stripe-pricing-table']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>; } } }

export default function Subs() {

    const navigate = useNavigate();


    const handleLogout = async () => {
        await localStorage.removeItem('accessToken');
        navigate('/login');
    }

    return (
        <>
            <Header onLogout={handleLogout} onTask={() => { navigate('/home')}} />
            <Container className="w-full custom-h p-5">
                <div className="text-4xl mb-5">Abonnements</div>
                <stripe-pricing-table pricing-table-id="prctbl_1P8i5AAKEXFdKZjYtlQDtOri"
                    publishable-key="pk_test_51LwSdyAKEXFdKZjYgLJovt7VeBWOVQ8SwC0Q7OhSojk3N2CwP5I3wr7V3HpW1YRLt4aNdgomuzy3cDBdQ1KTjs7L00Asa6x6xW">
                </stripe-pricing-table>
                {/* <div className="text-4xl">Abonnements</div>
                <Container className="w-full flex justify-center">
                    <Card className="w-96 h-96 m-2 p-2">
                        <Card.Body>
                            <Card.Title>Standard</Card.Title>
                            <Card.Text>
                                Abonnement Standard ...
                            </Card.Text>
                            <Button className="absolute bottom-5 right-5" variant="primary" href="https://buy.stripe.com/test_cN22bz47ObOygIofYZ">
                                S'abonner
                            </Button>
                        </Card.Body>
                    </Card>
                    <Card className="w-96 h-96 m-2 p-2">
                        <Card.Body>
                            <Card.Title>Premium</Card.Title>
                            <Card.Text>
                                Abonnement Premium ...
                            </Card.Text>
                            <Button className="absolute bottom-5 right-5" variant="primary" href="https://buy.stripe.com/test_6oEdUh33KdWGbo4aEG">
                                S'abonner
                            </Button>
                        </Card.Body>
                    </Card>
                </Container> */}
            </Container>
        </>
    )
}