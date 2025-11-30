import { useConfigByName } from '@nappr/nappr-config';
import classnames from 'classnames';
import React from 'react';
import { NavLink } from 'react-router';

import type { LayoutConfigInterface } from '../../../interfaces';
import styles from './app-menu.module.scss';

export const ApplicationMenu = React.memo(() => {
  const { navigation } = useConfigByName<LayoutConfigInterface>('Layout');

  return (
    <nav
      aria-label="Navigation principale"
      className={classnames('navbar is-sticky px-4v', styles.nav)}>
      <ul className="nav__list">
        {navigation.map((item) => (
          <li key={item.to} className="nav__item">
            <NavLink
              key={item.to}
              className="flex-center nav__link"
              title={item.label}
              to={item.to}>
              <item.icon aria-hidden="true" className="icon" />
              <span className="sr-only">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
});

ApplicationMenu.displayName = 'ApplicationMenu';
