import styles from './svg-icon.module.scss';

interface SvgIconProps {
  svg: string;
}

export function SvgIcon({ svg }: SvgIconProps) {
  return <span className={styles.root} dangerouslySetInnerHTML={{ __html: svg }} />;
}
