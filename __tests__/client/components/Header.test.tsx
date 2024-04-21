import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import Header, { HeaderProps } from '../../../src/components/Header'; // Assurez-vous d'importer le composant et ses props

describe('Header Component', () => {
    let component: RenderResult;
    let onLogoutMock: jest.Mock;

    beforeEach(() => {
        onLogoutMock = jest.fn();
        component = render(<Header onLogout={onLogoutMock} />);
    });

    it('renders without crashing', () => {
        expect(component).toBeDefined();
    });

    it('displays the title "Task Manager"', () => {
        expect(component.getByText('Task Manager')).toBeInTheDocument();
    });

    it('calls onLogout when the logout button is clicked', () => {
        fireEvent.click(component.getByText('Déconnexion'));
        expect(onLogoutMock).toHaveBeenCalled();
    });
});
