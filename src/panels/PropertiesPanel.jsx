import { useCallback } from 'react';
import useStore from '../store/useStore';
import './PropertiesPanel.css';

/* Reusable row with label + input */
function PropRow({ label, value, onChange, type = 'text', min, max, step }) {
  return (
    <div className="prop-row">
      <label className="prop-row__label">{label}</label>
      <input
        className="input input--sm prop-row__input"
        type={type}
        value={value ?? ''}
        onChange={(e) =>
          onChange(type === 'number' ? Number(e.target.value) : e.target.value)
        }
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

/* Color input row */
function ColorRow({ label, value, onChange }) {
  return (
    <div className="prop-row">
      <label className="prop-row__label">{label}</label>
      <div className="prop-color-input">
        <input
          type="color"
          className="prop-color-swatch"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className="input input--sm prop-color-text"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/* Select row */
function SelectRow({ label, value, onChange, options }) {
  return (
    <div className="prop-row">
      <label className="prop-row__label">{label}</label>
      <select
        className="input input--sm prop-row__input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/* Section wrapper */
function Section({ title, children, defaultOpen = true }) {
  return (
    <details className="prop-section" open={defaultOpen}>
      <summary className="prop-section__header">{title}</summary>
      <div className="prop-section__body">{children}</div>
    </details>
  );
}

export default function PropertiesPanel() {
  const selectedId = useStore((s) => s.selectedId);
  const components = useStore((s) => s.components);
  const updateComponent = useStore((s) => s.updateComponent);
  const deleteComponent = useStore((s) => s.deleteComponent);
  const duplicateComponent = useStore((s) => s.duplicateComponent);

  const comp = selectedId ? components[selectedId] : null;

  const updateStyle = useCallback(
    (key, value) => {
      if (!selectedId) return;
      updateComponent(selectedId, { style: { [key]: value } });
    },
    [selectedId, updateComponent],
  );

  const updateProp = useCallback(
    (key, value) => {
      if (!selectedId) return;
      updateComponent(selectedId, { props: { [key]: value } });
    },
    [selectedId, updateComponent],
  );

  const updateName = useCallback(
    (name) => {
      if (!selectedId) return;
      updateComponent(selectedId, { name });
    },
    [selectedId, updateComponent],
  );

  if (!comp) {
    return (
      <div className="panel panel--right animate-slide-right">
        <div className="panel__header">
          <span className="panel__title">Properties</span>
        </div>
        <div className="panel__body properties-empty">
          <div className="properties-empty__icon">⊘</div>
          <div className="properties-empty__text">
            Select an element to edit its properties
          </div>
        </div>
      </div>
    );
  }

  const { style, props, type, name } = comp;

  return (
    <div className="panel panel--right animate-slide-right">
      <div className="panel__header">
        <span className="panel__title">Properties</span>
        <div className="prop-actions">
          <button
            className="btn btn--ghost btn--icon tooltip"
            data-tooltip="Duplicate"
            onClick={() => duplicateComponent(selectedId)}
          >
            ⧉
          </button>
          <button
            className="btn btn--ghost btn--icon tooltip"
            data-tooltip="Delete"
            onClick={() => deleteComponent(selectedId)}
            style={{ color: 'var(--error)' }}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="panel__body properties-body">
        {/* Element info */}
        <Section title="Element">
          <PropRow label="Name" value={name} onChange={updateName} />
          <div className="prop-row">
            <label className="prop-row__label">Type</label>
            <span className="prop-type-badge">{type}</span>
          </div>
        </Section>

        {/* Content */}
        {['heading', 'paragraph', 'span', 'button', 'link', 'card'].includes(type) && (
          <Section title="Content">
            <PropRow
              label="Text"
              value={props.text}
              onChange={(v) => updateProp('text', v)}
            />
            {type === 'heading' && (
              <SelectRow
                label="Level"
                value={props.level}
                onChange={(v) => updateProp('level', Number(v))}
                options={[1, 2, 3, 4, 5, 6]}
              />
            )}
            {type === 'link' && (
              <PropRow
                label="URL"
                value={props.href}
                onChange={(v) => updateProp('href', v)}
              />
            )}
          </Section>
        )}

        {['input', 'textarea', 'select'].includes(type) && (
          <Section title="Content">
            <PropRow
              label="Placeholder"
              value={props.placeholder}
              onChange={(v) => updateProp('placeholder', v)}
            />
          </Section>
        )}

        {type === 'image' && (
          <Section title="Content">
            <PropRow
              label="Image URL"
              value={props.src}
              onChange={(v) => updateProp('src', v)}
            />
            <PropRow
              label="Alt Text"
              value={props.alt}
              onChange={(v) => updateProp('alt', v)}
            />
          </Section>
        )}

        {/* Layout / Position */}
        <Section title="Layout">
          <div className="prop-grid-2">
            <PropRow label="X" value={Math.round(style.left || 0)} onChange={(v) => updateStyle('left', v)} type="number" />
            <PropRow label="Y" value={Math.round(style.top || 0)} onChange={(v) => updateStyle('top', v)} type="number" />
            <PropRow label="W" value={Math.round(style.width || 0)} onChange={(v) => updateStyle('width', v)} type="number" min={20} />
            <PropRow label="H" value={Math.round(style.height || 0)} onChange={(v) => updateStyle('height', v)} type="number" min={20} />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" defaultOpen={false}>
          <PropRow label="Size" value={style.fontSize || ''} onChange={(v) => updateStyle('fontSize', v)} />
          <SelectRow
            label="Weight"
            value={style.fontWeight || '400'}
            onChange={(v) => updateStyle('fontWeight', v)}
            options={[
              { value: '300', label: 'Light' },
              { value: '400', label: 'Regular' },
              { value: '500', label: 'Medium' },
              { value: '600', label: 'Semi Bold' },
              { value: '700', label: 'Bold' },
              { value: '800', label: 'Extra Bold' },
            ]}
          />
          <ColorRow label="Color" value={style.color || ''} onChange={(v) => updateStyle('color', v)} />
          <PropRow label="Line Height" value={style.lineHeight || ''} onChange={(v) => updateStyle('lineHeight', v)} />
          <SelectRow
            label="Align"
            value={style.textAlign || 'left'}
            onChange={(v) => updateStyle('textAlign', v)}
            options={['left', 'center', 'right', 'justify']}
          />
        </Section>

        {/* Background */}
        <Section title="Background" defaultOpen={false}>
          <ColorRow label="Color" value={style.backgroundColor || ''} onChange={(v) => updateStyle('backgroundColor', v)} />
        </Section>

        {/* Border */}
        <Section title="Border" defaultOpen={false}>
          <PropRow label="Border" value={style.border || ''} onChange={(v) => updateStyle('border', v)} />
          <PropRow label="Radius" value={style.borderRadius || ''} onChange={(v) => updateStyle('borderRadius', v)} />
        </Section>

        {/* Effects */}
        <Section title="Effects" defaultOpen={false}>
          <PropRow label="Opacity" value={style.opacity ?? 1} onChange={(v) => updateStyle('opacity', Number(v))} type="number" min={0} max={1} step={0.05} />
          <PropRow label="Shadow" value={style.boxShadow || ''} onChange={(v) => updateStyle('boxShadow', v)} />
          <SelectRow
            label="Cursor"
            value={style.cursor || 'default'}
            onChange={(v) => updateStyle('cursor', v)}
            options={['default', 'pointer', 'text', 'move', 'not-allowed', 'crosshair']}
          />
        </Section>

        {/* Spacing */}
        <Section title="Spacing" defaultOpen={false}>
          <PropRow label="Padding" value={style.padding || ''} onChange={(v) => updateStyle('padding', v)} />
          <PropRow label="Margin" value={style.margin || ''} onChange={(v) => updateStyle('margin', v)} />
        </Section>
      </div>
    </div>
  );
}
