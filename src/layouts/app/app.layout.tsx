import React from 'react';
import { FaDumbbell, FaHome, FaList, FaPlus } from 'react-icons/fa';
import { Link, Outlet, useLocation } from 'react-router-dom';

import styles from './app.layout.module.css';

export const AppLayout = React.memo(() => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Training Programs</h1>
        <nav aria-label="Navigation principale" className={styles.nav}>
          <Link
            aria-current={isActive('/') ? 'page' : undefined}
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            to="/">
            <FaHome aria-hidden="true" />
            <span>Accueil</span>
          </Link>
          <Link
            aria-current={isActive('/exercises') ? 'page' : undefined}
            className={`${styles.navLink} ${isActive('/exercises') ? styles.active : ''}`}
            to="/exercises">
            <FaDumbbell aria-hidden="true" />
            <span>Exercices</span>
          </Link>
          <Link
            aria-current={isActive('/programs/create') ? 'page' : undefined}
            className={`${styles.navLink} ${isActive('/programs/create') ? styles.active : ''}`}
            to="/programs/create">
            <FaPlus aria-hidden="true" />
            <span>Créer</span>
          </Link>
          <Link
            aria-current={isActive('/programs') ? 'page' : undefined}
            className={`${styles.navLink} ${isActive('/programs') ? styles.active : ''}`}
            to="/programs">
            <FaList aria-hidden="true" />
            <span>Programmes</span>
          </Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';
