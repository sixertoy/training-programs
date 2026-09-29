import { muscleGroupColor } from '../../mocks';

interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  const color = muscleGroupColor(label) ?? '#888';

  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: `${color}30`,
        border: `1px solid ${color}50`,
        color,
      }}>
      {label}
    </span>
  );
}
