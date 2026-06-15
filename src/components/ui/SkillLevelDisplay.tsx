import React from 'react';

interface SkillLevelDisplayProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mode: 'bars' | 'stars' | 'dots';
  accentColor?: string;
}

export default function SkillLevelDisplay({
  level,
  mode,
  accentColor = '#2563eb',
}: SkillLevelDisplayProps) {
  // Convert level to value (1 to 4)
  const getLevelValue = () => {
    switch (level) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      case 'expert':
        return 4;
      default:
        return 2;
    }
  };

  const val = getLevelValue();

  if (mode === 'stars') {
    return (
      <span style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}>
        {[1, 2, 3, 4].map((star) => (
          <span key={star} style={{ fontSize: '13px' }}>
            {star <= val ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  }

  if (mode === 'dots') {
    return (
      <span style={{ display: 'inline-flex', gap: '4px', color: accentColor }}>
        {[1, 2, 3, 4].map((dot) => (
          <span
            key={dot}
            style={{
              fontSize: '15px',
              lineHeight: '1',
              color: dot <= val ? accentColor : '#e2e8f0',
            }}
          >
            {dot <= val ? '●' : '○'}
          </span>
        ))}
      </span>
    );
  }

  // default mode: 'bars'
  const pct = val * 25;
  return (
    <div
      style={{
        width: '50px',
        height: '6px',
        backgroundColor: '#e2e8f0',
        borderRadius: '999px',
        overflow: 'hidden',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: accentColor,
          borderRadius: '999px',
          transition: 'width 0.2s',
        }}
      />
    </div>
  );
}
