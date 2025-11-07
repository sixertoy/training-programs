import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaPause, FaStop } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button, Card } from '../../components';
import { useProgramView } from '../program-view/program-view.hook';
import styles from './program-run.module.css';

export const ProgramRun = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(true);
  const { formatTime, getCurrentExercise, program, timerStatus } = useProgramView(
    id || '',
    isRunning,
  );

  useEffect(() => {
    if (!program) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate('/programs');
    }
  }, [program, navigate]);

  if (!program) {
    return null;
  }

  const currentExercise = getCurrentExercise();

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (!id) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigate(`/programs/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to={`/programs/${id}`}>
          <Button variant="secondary">
            <FaArrowLeft aria-hidden="true" />
            Retour
          </Button>
        </Link>
        <h1 className={styles.title}>{program.name}</h1>
      </div>

      <div className={styles.timerContainer}>
        <Card className={styles.timerCard}>
          <div className={styles.timerInfo}>
            <div className={styles.seriesInfo}>
              Série {timerStatus.currentSeries} / {program.seriesCount}
            </div>
            {timerStatus.state === 'exercise' && currentExercise && (
              <div className={styles.exerciseInfo}>
                <h2>{currentExercise.exercise.name}</h2>
                {/* <h2 className={styles.exerciseName}>{currentExercise.exercise.name}</h2> */}
                <p className={styles.exerciseFormat}>
                  {currentExercise.format === 'reps'
                    ? `${currentExercise.value} répétitions`
                    : `${currentExercise.value} secondes`}
                </p>
              </div>
            )}
            {timerStatus.state === 'rest' && (
              <div className={styles.restInfo}>
                <h2>Repos</h2>
                <p>{program.restTimeSeconds} secondes</p>
              </div>
            )}
            {timerStatus.state === 'finished' && (
              <div className={styles.finishedInfo}>
                <h2>Programme terminé !</h2>
                <p>Félicitations !</p>
              </div>
            )}
          </div>
          <div className={styles.timer}>
            {timerStatus.state !== 'finished' && (
              <div className={styles.timeDisplay}>{formatTime(timerStatus.remainingSeconds)}</div>
            )}
          </div>
          <div className={styles.timerActions}>
            {timerStatus.state !== 'finished' &&
              (isRunning ? (
                <Button variant="secondary" onClick={handlePause}>
                  <FaPause aria-hidden="true" />
                  Pause
                </Button>
              ) : (
                <Button onClick={handleResume}>Reprendre</Button>
              ))}
            <Button variant="danger" onClick={handleStop}>
              <FaStop aria-hidden="true" />
              Arrêter
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

ProgramRun.displayName = 'ProgramRun';
