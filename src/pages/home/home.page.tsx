import React from 'react';
import styles from './home.module.css';

export const Home = React.memo(() => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Training Programs</h1>
      <p className={styles.description}>
        Bienvenue dans votre application de gestion de programmes d&apos;entraînement
      </p>
    </div>
  );
});

Home.displayName = 'Home';
