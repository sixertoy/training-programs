import React from 'react';
import { Link } from 'react-router';

import { Button, Card } from '../../components';
import styles from './home.module.css';

export const HomePage = React.memo(() => {
  return (
    <React.Fragment>
      <Card className="grid-col-4 text-center">
        <h2>Nouveau Programme</h2>
        <p>Ajoutez, modifiez et organisez votre bibliothèque d&apos;exercices.</p>
        <Link className="btn btn--rounded btn--primary" to="/programs/create">
          Créer programme
        </Link>
      </Card>
      <Card className="grid-col-12 text-center">
        <h2>Mes Programmes</h2>
        <p className={styles.cardDescription}>
          Consultez et lancez vos programmes d&apos;entraînement sauvegardés.
        </p>
        <Link to="/programs">
          <Button>Voir mes programmes</Button>
        </Link>
      </Card>
    </React.Fragment>
  );
});

HomePage.displayName = 'HomePage';
