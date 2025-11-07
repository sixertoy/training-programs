import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { Button, Card, Input, Modal, Select } from '../../components';
import type { ExerciseFormat } from '../../interfaces';
import { useCreateProgram } from './create-program.hook';
import styles from './create-program.module.css';

interface ProgramFormData {
  name: string;
  seriesCount: number;
  restTimeSeconds: number;
}

interface ExerciseFormData {
  exerciseId: string;
  format: ExerciseFormat;
  value: number;
}

export const CreateProgram = React.memo(() => {
  const navigate = useNavigate();
  const {
    addExerciseToProgram,
    exercises,
    removeExerciseFromProgram,
    reset,
    saveProgram,
    selectedExercises,
    updateExerciseInProgram,
  } = useCreateProgram();

  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

  const {
    formState: { errors: programErrors },
    handleSubmit: handleSubmitProgram,
    register: registerProgram,
  } = useForm<ProgramFormData>({
    defaultValues: {
      name: '',
      restTimeSeconds: 90,
      seriesCount: 4,
    },
  });

  const {
    formState: { errors: exerciseErrors },
    handleSubmit: handleSubmitExercise,
    register: registerExercise,
    reset: resetExerciseForm,
  } = useForm<ExerciseFormData>({
    defaultValues: {
      exerciseId: '',
      format: 'reps',
      value: 10,
    },
  });

  const onSubmitProgram = (data: ProgramFormData) => {
    if (selectedExercises.length === 0) {
      alert('Veuillez ajouter au moins un exercice au programme');
      return;
    }
    saveProgram(data.name, data.seriesCount, data.restTimeSeconds);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigate('/programs');
  };

  const onSubmitExercise = (data: ExerciseFormData) => {
    const exercise = exercises.find(ex => ex.id === data.exerciseId);
    if (exercise) {
      addExerciseToProgram(exercise, data.format, data.value);
      setIsAddExerciseModalOpen(false);
      resetExerciseForm();
    }
  };

  // const exerciseOptions = exercises.map(ex => ({
  //   label: `${ex.name} (${ex.type})`,
  //   value: ex.id,
  // }));

  const formatOptions = [
    { label: 'Répétitions', value: 'reps' },
    { label: 'Durée (secondes)', value: 'time' },
  ];

  const getAvailableExercises = () => {
    const selectedIds = selectedExercises.map(ex => ex.exercise.id);
    return exercises.filter(ex => !selectedIds.includes(ex.id));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Créer un Programme d&apos;Entraînement</h1>

      <form className={styles.form} onSubmit={handleSubmitProgram(onSubmitProgram)}>
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>Informations du Programme</h2>
          <Input
            label="Nom du Programme"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerProgram('name', { required: 'Le nom est requis' })}
            error={programErrors.name?.message}
          />
          <Input
            label="Nombre de Séries"
            min="1"
            type="number"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerProgram('seriesCount', {
              min: { message: 'Minimum 1 série', value: 1 },
              required: 'Le nombre de séries est requis',
            })}
            error={programErrors.seriesCount?.message}
          />
          <Input
            label="Temps de Repos entre les Séries (secondes)"
            min="0"
            type="number"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerProgram('restTimeSeconds', {
              min: { message: 'Minimum 0 seconde', value: 0 },
              required: 'Le temps de repos est requis',
            })}
            error={programErrors.restTimeSeconds?.message}
          />
        </Card>

        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Exercices</h2>
            <Button
              disabled={getAvailableExercises().length === 0}
              type="button"
              onClick={() => {
                setIsAddExerciseModalOpen(true);
              }}>
              <FaPlus aria-hidden="true" />
              Ajouter un exercice
            </Button>
          </div>

          {selectedExercises.length === 0 ? (
            <p className={styles.empty}>
              Aucun exercice ajouté. Cliquez sur &quot;Ajouter un exercice&quot; pour commencer.
            </p>
          ) : (
            <div className={styles.exercisesList}>
              {selectedExercises.map((exerciseInProgram, index) => {
                const { exercise, format, value } = exerciseInProgram;
                const key = `${exercise.id}-${index}`;
                return (
                  <Card key={key} className={styles.exerciseCard}>
                    <div className={styles.exerciseHeader}>
                      <div>
                        <h3 className={styles.exerciseName}>{exercise.name}</h3>
                        <p className={styles.exerciseType}>{exercise.type}</p>
                      </div>
                      <Button
                        aria-label={`Supprimer ${exercise.name}`}
                        type="button"
                        variant="danger"
                        onClick={() => {
                          removeExerciseFromProgram(index);
                        }}>
                        <FaTrash aria-hidden="true" />
                      </Button>
                    </div>
                    <div className={styles.exerciseParams}>
                      <Select
                        label="Format"
                        options={formatOptions}
                        value={format}
                        onChange={e => {
                          updateExerciseInProgram(index, e.target.value as ExerciseFormat, value);
                        }}
                      />
                      <Input
                        label={format === 'reps' ? 'Répétitions' : 'Durée (secondes)'}
                        min="1"
                        type="number"
                        value={value}
                        onChange={e => {
                          updateExerciseInProgram(index, format, parseInt(e.target.value, 10) || 1);
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={reset}>
            Réinitialiser
          </Button>
          <Button type="submit">Enregistrer le Programme</Button>
        </div>
      </form>

      <Modal
        footer={
          <React.Fragment>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddExerciseModalOpen(false);
                resetExerciseForm();
              }}>
              Annuler
            </Button>
            <Button onClick={handleSubmitExercise(onSubmitExercise)}>Ajouter</Button>
          </React.Fragment>
        }
        isOpen={isAddExerciseModalOpen}
        title="Ajouter un exercice au programme"
        onClose={() => {
          setIsAddExerciseModalOpen(false);
          resetExerciseForm();
        }}>
        <form className={styles.form} onSubmit={handleSubmitExercise(onSubmitExercise)}>
          <Select
            label="Exercice"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerExercise('exerciseId', {
              required: 'Veuillez sélectionner un exercice',
            })}
            error={exerciseErrors.exerciseId?.message}
            options={getAvailableExercises().map(ex => ({
              label: `${ex.name} (${ex.type})`,
              value: ex.id,
            }))}
          />
          <Select
            label="Format"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerExercise('format', { required: 'Le format est requis' })}
            error={exerciseErrors.format?.message}
            options={formatOptions}
          />
          <Input
            label="Valeur"
            min="1"
            type="number"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...registerExercise('value', {
              min: { message: 'Minimum 1', value: 1 },
              required: 'La valeur est requise',
            })}
            error={exerciseErrors.value?.message}
          />
        </form>
      </Modal>
    </div>
  );
});

CreateProgram.displayName = 'CreateProgram';
