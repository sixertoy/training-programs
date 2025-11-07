import { DateTime } from 'luxon';
import React from 'react';
import { FaEye, FaPlay, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Button, Card, Modal } from '../../components';
import { useProgramList } from './program-list.hook';
import styles from './program-list.module.css';

export const ProgramList = React.memo(() => {
  const { cancelDelete, deleteId, handleDelete, programs, startDelete } = useProgramList();

  const sortedPrograms = [...programs].sort((a, b) =>
    DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt)).as('milliseconds'),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mes Programmes</h1>
        <Link to="/programs/create">
          <Button>Créer un nouveau programme</Button>
        </Link>
      </div>

      {sortedPrograms.length === 0 ? (
        <Card className={styles.empty}>
          <p>Aucun programme sauvegardé.</p>
          <Link to="/programs/create">
            <Button>Créer votre premier programme</Button>
          </Link>
        </Card>
      ) : (
        <div className={styles.programsGrid}>
          {sortedPrograms.map(program => (
            <Card key={program.id} className={styles.programCard}>
              <div className={styles.programHeader}>
                <h2 className={styles.programName}>{program.name}</h2>
                <button
                  aria-label={`Supprimer ${program.name}`}
                  className={styles.deleteButton}
                  onClick={() => {
                    startDelete(program.id);
                  }}>
                  <FaTrash aria-hidden="true" />
                </button>
              </div>
              <div className={styles.programInfo}>
                <p>
                  <strong>{program.seriesCount}</strong> série{program.seriesCount > 1 ? 's' : ''}
                </p>
                <p>
                  <strong>{program.restTimeSeconds}s</strong> de repos
                </p>
                <p>
                  <strong>{program.exercises.length}</strong> exercice
                  {program.exercises.length > 1 ? 's' : ''}
                </p>
              </div>
              <p className={styles.programDate}>
                Créé le {DateTime.fromISO(program.createdAt).toLocaleString(DateTime.DATE_MED)}
              </p>
              <div className={styles.programActions}>
                <Link className={styles.actionLink} to={`/programs/${program.id}`}>
                  <Button variant="secondary">
                    <FaEye aria-hidden="true" />
                    Voir
                  </Button>
                </Link>
                <Link className={styles.actionLink} to={`/programs/${program.id}/run`}>
                  <Button>
                    <FaPlay aria-hidden="true" />
                    Lancer
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        footer={
          <React.Fragment>
            <Button variant="secondary" onClick={cancelDelete}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </React.Fragment>
        }
        isOpen={!!deleteId}
        title="Supprimer le programme"
        onClose={cancelDelete}>
        <p>Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.</p>
      </Modal>
    </div>
  );
});

ProgramList.displayName = 'ProgramList';
