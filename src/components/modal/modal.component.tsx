import React, { useEffect, useRef } from 'react';

import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = React.memo(({ children, footer, isOpen, onClose, title }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Le dialog se ferme si on clique directement sur l'élément dialog (backdrop)
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    // Escape est déjà géré nativement par le dialog, mais on l'ajoute pour satisfaire ESLint
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className={styles.modal}
      onClick={handleBackdropClick}
      onClose={onClose}
      onKeyDown={handleKeyDown}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title} id="modal-title">
            {title}
          </h2>
          <button aria-label="Fermer la modale" className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
});

Modal.displayName = 'Modal';
