import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';

type NotifRef = {
  openToast: (message: string) => void;
};

const Notif = forwardRef<NotifRef>((props, ref) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const openToast = (message: string) => {
    setMessage(message);
    setShow(true);
  };

  // Exposer la méthode openToast à l'extérieur du composant
  useImperativeHandle(ref, () => ({
    openToast: (message: string) => openToast(message),
  }));

  return (
    <ToastContainer position='top-end' className="p-2">
      <Toast show={show} onClose={() => setShow(false)} delay={3000} autohide>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
});

export default Notif;
export type { NotifRef };
