import classnames from 'classnames';
import React from 'react';
import { Link } from 'react-router';

import styles from './app-header.module.scss';

export const AppHeaderComponent = React.memo(() => {
  return (
    <header className={classnames('is-sticky p-4v', styles.header)}>
      <h1 className="text-center m-0">
        <Link className="is-block is-layout" title="retour à l'accueil" to="/">
          Training Programs
        </Link>
      </h1>
    </header>
  );
});

AppHeaderComponent.displayName = 'AppHeaderComponent';
