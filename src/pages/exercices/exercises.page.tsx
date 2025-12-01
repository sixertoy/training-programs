import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaPlus, FaSort, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';

import { Button, Card, Input, Modal, Select } from '../../components';
import { ExerciceTypeEnum } from '../../enums';
import type { Exercise } from '../../interfaces';
import { useExercises } from './exercises.hook';
import styles from './exercises.module.css';

interface ExerciceFormData {
  name: string;
  type: ExerciceTypeEnum;
  description: string;
}

export const ExercicesPage = React.memo(() => {
  const {
    cancelDelete,
    cancelEdit,
    deleteId,
    editingId,
    exercises,
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
  } = useExercises();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const editingExercise = exercises.find((ex) => ex.id === editingId);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ExerciceFormData>({
    defaultValues: editingExercise ?? {
      description: '',
      name: '',
      type: ExerciceTypeEnum.UPPER_BODY,
    },
  });

  const onSubmit = (data: ExerciceFormData) => {
    if (editingId) {
      handleUpdate(editingId, data);
    } else {
      handleAdd(data);
      setIsAddModalOpen(false);
    }
    reset();
  };

  const handleEditClick = (exercise: Exercise) => {
    startEdit(exercise.id);
    reset({
      description: exercise.description,
      name: exercise.name,
      type: exercise.type,
    });
  };

  const handleCancel = () => {
    cancelEdit();
    reset();
  };

  const exerciseTypeOptions = Object.values(ExerciceTypeEnum).map((type) => ({
    label: type,
    value: type,
  }));

  const filterOptions = [{ label: 'Tous', value: 'all' }, ...exerciseTypeOptions];

  const getSortIcon = (field: 'name' | 'type') => {
    if (sortField !== field) {
      return <FaSort aria-hidden="true" className={styles.sortIcon} />;
    }
    return sortOrder === 'asc' ? (
      <FaSortUp aria-hidden="true" className={styles.sortIcon} />
    ) : (
      <FaSortDown aria-hidden="true" className={styles.sortIcon} />
    );
  };

  return (
    <div className="flex-rows gap-1-5v">
      <button
        className="btn btn--rounded btn--primary"
        onClick={() => {
          setIsAddModalOpen(true);
        }}>
        Ajouter un exercice
      </button>

      <Card className={styles.filters}>
        <Select
          label="Filtrer par type"
          options={filterOptions}
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as ExerciceTypeEnum | 'all');
          }}
        />
      </Card>

      <div className={styles.tableContainer}>
        <table className={styles.table} role="table">
          <thead>
            <tr>
              <th>
                <button
                  aria-label="Trier par nom"
                  className={styles.sortButton}
                  onClick={() => {
                    handleSort('name');
                  }}>
                  Nom {getSortIcon('name')}
                </button>
              </th>
              <th>
                <button
                  aria-label="Trier par type"
                  className={styles.sortButton}
                  onClick={() => {
                    handleSort('type');
                  }}>
                  Type {getSortIcon('type')}
                </button>
              </th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={4}>
                  Aucun exercice trouvé. Ajoutez votre premier exercice !
                </td>
              </tr>
            ) : (
              exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.name}</td>
                  <td>{exercise.type}</td>
                  <td>{exercise.description}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        aria-label={`Modifier ${exercise.name}`}
                        className={styles.actionButton}
                        onClick={() => {
                          handleEditClick(exercise);
                        }}>
                        <FaEdit aria-hidden="true" />
                      </button>
                      <button
                        aria-label={`Supprimer ${exercise.name}`}
                        className={styles.actionButton}
                        onClick={() => {
                          startDelete(exercise.id);
                        }}>
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        footer={
          <React.Fragment>
            <button
              className="btn btn--rounded btn--secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                reset();
              }}>
              Annuler
            </button>
            <button
              className="btn btn--rounded btn--primary"
              onClick={() => handleSubmit(onSubmit)}>
              Ajouter
            </button>
          </React.Fragment>
        }
        isOpen={isAddModalOpen}
        title="Ajouter un exercice"
        onClose={() => {
          setIsAddModalOpen(false);
          reset();
        }}>
        <form className={styles.form} onSubmit={() => handleSubmit(onSubmit)}>
          <Input
            label="Nom"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register('name', { required: 'Le nom est requis' })}
            error={errors.name?.message}
          />
          <Select
            label="Type"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register('type', { required: 'Le type est requis' })}
            error={errors.type?.message}
            options={exerciseTypeOptions}
          />
          <Input
            label="Description"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register('description', { required: 'La description est requise' })}
            error={errors.description?.message}
          />
        </form>
      </Modal>

      {editingId && editingExercise && (
        <Modal
          footer={
            <React.Fragment>
              <button className="btn btn--rounded btn--secondary" onClick={handleCancel}>
                Annuler
              </button>
              <button
                className="btn btn--rounded btn--primary"
                onClick={() => handleSubmit(onSubmit)}>
                Enregistrer
              </button>
            </React.Fragment>
          }
          isOpen={!!editingId}
          title="Modifier l'exercice"
          onClose={handleCancel}>
          <form className={styles.form} onSubmit={() => handleSubmit(onSubmit)}>
            <Input
              label="Nom"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('name', { required: 'Le nom est requis' })}
              error={errors.name?.message}
            />
            <Select
              label="Type"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('type', { required: 'Le type est requis' })}
              error={errors.type?.message}
              options={exerciseTypeOptions}
            />
            <Input
              label="Description"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('description', { required: 'La description est requise' })}
              error={errors.description?.message}
            />
          </form>
        </Modal>
      )}

      <Modal
        footer={
          <React.Fragment>
            <button className="btn btn--rounded btn--secondary" onClick={cancelDelete}>
              Annuler
            </button>
            <button className="btn btn--rounded btn--danger" onClick={handleDelete}>
              Supprimer
            </button>
          </React.Fragment>
        }
        isOpen={!!deleteId}
        title="Supprimer l'exercice"
        onClose={cancelDelete}>
        <p>Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
});

ExercicesPage.displayName = 'ExercisesPage';
