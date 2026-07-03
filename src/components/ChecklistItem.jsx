import React from 'react';

export default function ChecklistItem({ label, type = 'toggle', value, onChange, unit, description }) {
  return (
    <div className="checklist-item">
      <div className="checklist-header">
        <div>
          <div className="checklist-label">{label}</div>
          {description && <div className="checklist-description">{description}</div>}
        </div>
        {type === 'toggle' && (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        )}
      </div>
      {type === 'number' && (
        <div className="checklist-input-row">
          <input
            type="number"
            className="checklist-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            min="0"
          />
          {unit && <span className="checklist-unit">{unit}</span>}
        </div>
      )}
      {type === 'text' && (
        <div className="checklist-input-row" style={{ marginTop: '8px' }}>
          <input
            type="text"
            className="checklist-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={description || ''}
          />
          {unit && <span className="checklist-unit">{unit}</span>}
        </div>
      )}
    </div>
  );
}
