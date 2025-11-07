import React from 'react';
import { FaDumbbell, FaList, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Button, Card } from '../../components';
import styles from './home.module.css';

export const Home = React.memo(() => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Training Programs</h1>
        <p className={styles.description}>
          Créez et gérez vos programmes d&apos;entraînement personnalisés. Définissez vos exercices,
          organisez vos séries et suivez vos progrès.
        </p>
      </div>

      <div className={styles.actions}>
        <Card className={styles.actionCard}>
          <FaDumbbell aria-hidden="true" className={styles.icon} />
          <h2 className={styles.cardTitle}>Gérer les Exercices</h2>
          <p className={styles.cardDescription}>
            Ajoutez, modifiez et organisez votre bibliothèque d&apos;exercices.
          </p>
          <Link to="/exercises">
            <Button>Voir les exercices</Button>
          </Link>
        </Card>

        <Card className={styles.actionCard}>
          <FaPlus aria-hidden="true" className={styles.icon} />
          <h2 className={styles.cardTitle}>Créer un Programme</h2>
          <p className={styles.cardDescription}>
            Créez un nouveau programme d&apos;entraînement personnalisé avec vos exercices.
          </p>
          <Link to="/programs/create">
            <Button>Créer un programme</Button>
          </Link>
        </Card>

        <Card className={styles.actionCard}>
          <FaList aria-hidden="true" className={styles.icon} />
          <h2 className={styles.cardTitle}>Mes Programmes</h2>
          <p className={styles.cardDescription}>
            Consultez et lancez vos programmes d&apos;entraînement sauvegardés.
          </p>
          <Link to="/programs">
            <Button>Voir mes programmes</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
});

Home.displayName = 'Home';
