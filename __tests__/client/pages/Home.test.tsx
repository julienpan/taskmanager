import React from 'react';
import { render, fireEvent, waitFor, screen, getByText } from '@testing-library/react';
import axios, { AxiosResponse } from 'axios';
import Home from '../../../src/pages/Home';
import { MemoryRouter } from 'react-router-dom';
import Notif from '../../../src/components/Notif';
import { act } from 'react-dom/test-utils';


const mockUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUsedNavigate,
}));

describe('Home Component', () => {

    beforeEach(() => {
        jest.mock('axios', () => {
            return {
                create: jest.fn(() => ({
                    get: jest.fn(),
                    post: jest.fn().mockImplementation(() => Promise.resolve()),
                    interceptors: {
                        request: { use: jest.fn(), eject: jest.fn() },
                        response: { use: jest.fn(), eject: jest.fn() }
                    }
                }))
            }
        });
    })

    afterEach(() => {
        jest.clearAllMocks();
    });
    test('renders home page', async () => {
        axios.get = jest.fn().mockResolvedValue({
            data: {
                data: [],
                totalDataCount: 0,
            }
        });


        await act(async () => render(<Home />));

        // Assert that some key elements are present
        expect(screen.getByText(/Liste des tâches/i)).toBeInTheDocument(); // Utilisation d'une expression régulière pour rechercher le texte "Liste des tâches" de manière insensible à la casse
        expect(screen.getByTestId('custom-table')).toBeInTheDocument(); // Vérifie la présence d'un élément avec le rôle "table"
        expect(screen.getByText(/Créer une tâche/i)).toBeInTheDocument(); // Utilisation d'une expression régulière pour rechercher le texte "Créer une tâche" de manière insensible à la casse
    });

    test('creates a task', async () => {
        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                data: [],
                totalDataCount: 0,
            }
        });

        await act(async () => render(<Home />));
        await act(async () => fireEvent.click(screen.getByText('Créer une tâche')));
        await act(async () => fireEvent.change(screen.getByPlaceholderText('Titre de la tâche'), { target: { value: 'Sample Task' } }));
        await act(async () => fireEvent.click(screen.getByText('Créer')));
    });

});