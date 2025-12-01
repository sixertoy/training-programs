import classnames from 'classnames';
import React from 'react';

import { useModal } from '../../hooks';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = React.memo(({ children, footer, isOpen, onClose, title }: ModalProps) => {
  const { dialogRef, handleBackdropClick, handleKeyDown } = useModal({ isOpen, onClose });

  if (!isOpen) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className={styles.modal}
      onClick={handleBackdropClick}
      onClose={onClose}
      onKeyDown={handleKeyDown}>
      <div className={classnames('flex-rows', styles.content)}>
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
