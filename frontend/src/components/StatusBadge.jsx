'use client';

import { getStatusColor } from '@/utils/helpers';

export default function StatusBadge({ status }) {
  const color = getStatusColor(status);
  return (
    <span className={`badge badge-${color}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'currentColor',
        display: 'inline-block',
      }} />
      {status}
    </span>
  );
}
