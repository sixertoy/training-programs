import { useCallback, useState } from 'react';

import { useProgram } from '../../contexts/program';

export const useProgramList = () => {
  const { deleteProgram, programs } = useProgram();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteProgram(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteProgram]);

  const startDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  return {
    cancelDelete,
    deleteId,
    handleDelete,
    programs,
    startDelete,
  };
};
