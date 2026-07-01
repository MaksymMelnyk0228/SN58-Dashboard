import type { PerformancePoint } from '@sn58/shared';

interface LineChartProps {
  points: PerformancePoint[];
  valueKey: 'score' | 'emissions';
  color?: string;
  label: string;
}

export function LineChart({ points, valueKey, color = '#3ee0c5', label }: LineChartProps) {
  const width = 640;
  const height = 220;
  const padding = 32;

  if (points.length === 0) {
    return <p className="muted">No historical points available.</p>;
  }

  const values = points.map((point) => point[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
    const y = height - padding - ((point[valueKey] - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div>
      <div className="chart-legend">
        <span style={{ color }}>{label}</span>
        <span>
          {min.toFixed(4)} – {max.toFixed(4)}
        </span>
      </div>
      <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={coords.join(' ')}
        />
        {points.map((point, index) => {
          const [x, y] = coords[index].split(',');
          return (
            <circle
              key={point.recordedAt}
              cx={x}
              cy={y}
              r="3.5"
              fill={color}
            >
              <title>
                {new Date(point.recordedAt).toLocaleDateString()}: {point[valueKey]}
              </title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
