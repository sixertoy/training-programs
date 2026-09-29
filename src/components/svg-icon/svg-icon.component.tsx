interface SvgIconProps {
  svg: string;
}

export function SvgIcon({ svg }: SvgIconProps) {
  return <span dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'contents' }} />;
}
