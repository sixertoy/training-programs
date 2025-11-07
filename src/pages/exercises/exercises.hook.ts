import { useCallback, useMemo, useState } from 'react';

import { useExercise } from '../../contexts/exercise';
import type { ExerciseTypeEnum } from '../../enums';
import type { Exercise } from '../../interfaces';

type SortField = 'name' | 'type';
type SortOrder = 'asc' | 'desc';

export const useExercises = () => {
  const { addExercise, deleteExercise, exercises, updateExercise } = useExercise();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<ExerciseTypeEnum | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedExercises = useMemo(() => {
    let filtered = exercises;

    if (filterType !== 'all') {
      filtered = exercises.filter(ex => ex.type === filterType);
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.type.localeCompare(b.type);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [exercises, sortField, sortOrder, filterType]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField],
  );

  const handleAdd = useCallback(
    (exercise: Omit<Exercise, 'id'>) => {
      addExercise(exercise);
    },
    [addExercise],
  );

  const handleUpdate = useCallback(
    (id: string, exercise: Omit<Exercise, 'id'>) => {
      updateExercise(id, exercise);
      setEditingId(null);
    },
    [updateExercise],
  );

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteExercise(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteExercise]);

  const startEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const startDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  return {
    cancelDelete,
    cancelEdit,
    deleteId,
    editingId,
    exercises: sortedExercises,
    filterType,
    handleAdd,
    handleDelete,
    handleSort,
    handleUpdate,
    setFilterType,
    sortField,
    sortOrder,
    startDelete,
    startEdit,
  };
};
