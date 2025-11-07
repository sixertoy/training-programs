import React from 'react';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

import { Button, Card } from '../../components';
import { useProgram } from '../../contexts/program';
import styles from './program-view.module.css';

export const ProgramView = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const { getProgramById } = useProgram();
  const program = id ? getProgramById(id) : undefined;

  if (!program) {
    return (
      <div className={styles.container}>
        <Card>
          <p>Programme non trouvé.</p>
          <Link to="/programs">
            <Button>Retour à la liste</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/programs">
          <Button variant="secondary">
            <FaArrowLeft aria-hidden="true" />
            Retour
          </Button>
        </Link>
        <h1 className={styles.title}>{program.name}</h1>
      </div>

      <div className={styles.programDetails}>
        <Card className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>Informations</h2>
          <div className={styles.infoGrid}>
            <div>
              <strong>Nombre de séries:</strong> {program.seriesCount}
            </div>
            <div>
              <strong>Temps de repos:</strong> {program.restTimeSeconds} secondes
            </div>
            <div>
              <strong>Nombre d&apos;exercices:</strong> {program.exercises.length}
            </div>
          </div>
        </Card>

        <Card className={styles.exercisesCard}>
          <h2 className={styles.sectionTitle}>Exercices</h2>
          <div className={styles.exercisesList}>
            {program.exercises.map((exerciseInProgram, index) => {
              const key = `${exerciseInProgram.exercise.id}-${index}`;
              return (
                <div key={key} className={styles.exerciseItem}>
                  <div className={styles.exerciseHeader}>
                    <h3 className={styles.exerciseName}>{exerciseInProgram.exercise.name}</h3>
                    <span className={styles.exerciseType}>{exerciseInProgram.exercise.type}</span>
                  </div>
                  <p className={styles.exerciseFormat}>
                    {exerciseInProgram.format === 'reps'
                      ? `${exerciseInProgram.value} répétitions`
                      : `${exerciseInProgram.value} secondes`}
                  </p>
                  {exerciseInProgram.exercise.description && (
                    <p className={styles.exerciseDescription}>
                      {exerciseInProgram.exercise.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className={styles.actions}>
          <Link to={`/programs/${id}/run`}>
            <Button size="large">
              <FaPlay aria-hidden="true" />
              Démarrer l&apos;entraînement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

ProgramView.displayName = 'ProgramView';
