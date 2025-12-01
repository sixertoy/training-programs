import { useEffect, useRef } from 'react';

interface UseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useModal = ({ isOpen, onClose }: UseModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Le dialog se ferme
    // si on clique directement sur l'élément dialog (backdrop)
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    // Escape est déjà géré nativement par le dialog,
    // mais on l'ajoute pour satisfaire ESLint
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return {
    dialogRef,
    handleBackdropClick,
    handleKeyDown,
  };
};
