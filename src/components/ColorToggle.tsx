import React from 'react';

interface Props {
  color: string;
  enabled: boolean;
  onToggle: () => void;
}

export const ColorToggle: React.FC<Props> = ({ color, enabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 28,
        height: 28,
        borderRadius: 4,
        border: enabled ? '2px solid #fff' : '2px solid #444',
        background: color,
        cursor: 'pointer',
        opacity: enabled ? 1 : 0.35,
        transition: 'opacity 0.15s, border-color 0.15s',
        padding: 0,
      }}
      title={color}
    />
  );
};
