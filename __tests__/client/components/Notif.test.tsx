import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notif, { NotifRef } from '../../../src/components/Notif';
import { act } from 'react-dom/test-utils';

jest.useFakeTimers(); 

describe('Notif Component', () => {
    it('displays toast with correct message when opened', async () => {
        const { getByText } = render(<Notif />);

        const notifRef: React.MutableRefObject<NotifRef | null> = { current: null };
        await act(async () => render(<Notif ref={notifRef} />));

        const message = 'This is a test message';
        await act(async () => notifRef.current?.openToast(message));

        // Vérifie que le toast s'affiche avec le bon message
        await waitFor(() => {
            expect(getByText(message)).toBeInTheDocument();
        });
    });

    it('closes toast after delay', async () => {
        const { queryByText } = render(<Notif />);

        const notifRef: React.MutableRefObject<NotifRef | null> = { current: null };
        await act(async () => render(<Notif ref={notifRef} />));

        const message = 'This is another test message';

        // Ouvrir le toast
        await act(async () => notifRef.current?.openToast(message));

        // Attendre que le toast soit affiché
        await waitFor(() => {
            expect(queryByText(message)).toBeInTheDocument();
        });
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // Attendre que le toast soit fermé
        await waitFor(() => {
            expect(queryByText(message)).not.toBeInTheDocument();
        });
    });
});
