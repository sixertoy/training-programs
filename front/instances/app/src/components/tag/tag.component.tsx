import type { CSSProperties } from 'react';

import { muscleGroupColor } from '../../mocks';
import styles from './tag.module.scss';

interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  const color = muscleGroupColor(label) ?? '#888';
  const tagStyle = { '--tag-color': color } as CSSProperties;

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.tag}`} style={tagStyle}>
      {label}
    </span>
  );
}
