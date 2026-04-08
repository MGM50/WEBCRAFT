import useStore from '../store/useStore';
import './Toolbar.css';

export default function Toolbar() {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canvasSettings = useStore((s) => s.canvasSettings);
  const updateCanvasSettings = useStore((s) => s.updateCanvasSettings);
  const setZoom = useStore((s) => s.setZoom);
  const toggleCodePreview = useStore((s) => s.toggleCodePreview);
  const saveProject = useStore((s) => s.saveProject);
  const loadProject = useStore((s) => s.loadProject);
  const clearCanvas = useStore((s) => s.clearCanvas);
  const history = useStore((s) => s.history);
  const componentCount = useStore((s) => Object.keys(s.components).length);

  const { zoom, gridEnabled, snapToGrid, width } = canvasSettings;

  const presets = [
    { label: 'Desktop', w: 1440, h: 900 },
    { label: 'Tablet', w: 768, h: 1024 },
    { label: 'Mobile', w: 375, h: 812 },
  ];

  const activePreset = presets.find((p) => p.w === width)?.label || 'Custom';

  return (
    <div className="app-toolbar">
      {/* Logo */}
      <div className="toolbar-logo">
        <span className="toolbar-logo__icon">◆</span>
        <span className="toolbar-logo__text">WebCraft</span>
      </div>

      <div className="separator" />

      {/* Undo / Redo */}
      <button
        className="btn btn--ghost btn--icon tooltip"
        data-tooltip="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={history.past.length === 0}
      >
        ↶
      </button>
      <button
        className="btn btn--ghost btn--icon tooltip"
        data-tooltip="Redo (Ctrl+Shift+Z)"
        onClick={redo}
        disabled={history.future.length === 0}
      >
        ↷
      </button>

      <div className="separator" />

      {/* Device presets */}
      <div className="toolbar-presets">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={`btn btn--ghost toolbar-preset-btn ${
              activePreset === preset.label ? 'active' : ''
            }`}
            onClick={() =>
              updateCanvasSettings({ width: preset.w, height: preset.h })
            }
          >
            {preset.label === 'Desktop' && '🖥'}
            {preset.label === 'Tablet' && '📱'}
            {preset.label === 'Mobile' && '📲'}
            <span className="toolbar-preset-label">{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="separator" />

      {/* Zoom controls */}
      <div className="toolbar-zoom">
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => setZoom(zoom - 0.1)}
          disabled={zoom <= 0.1}
        >
          −
        </button>
        <span className="toolbar-zoom__value">{Math.round(zoom * 100)}%</span>
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => setZoom(zoom + 0.1)}
          disabled={zoom >= 3}
        >
          +
        </button>
        <button
          className="btn btn--ghost toolbar-zoom-reset"
          onClick={() => setZoom(1)}
        >
          Fit
        </button>
      </div>

      <div className="separator" />

      {/* Grid toggle */}
      <button
        className={`btn btn--ghost tooltip ${gridEnabled ? 'active' : ''}`}
        data-tooltip="Toggle Grid"
        onClick={() => updateCanvasSettings({ gridEnabled: !gridEnabled })}
      >
        ⊞ Grid
      </button>
      <button
        className={`btn btn--ghost tooltip ${snapToGrid ? 'active' : ''}`}
        data-tooltip="Snap to Grid"
        onClick={() => updateCanvasSettings({ snapToGrid: !snapToGrid })}
      >
        ⊡ Snap
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Component count */}
      <span className="toolbar-count">{componentCount} elements</span>

      <div className="separator" />

      {/* Save / Load */}
      <button className="btn btn--ghost tooltip" data-tooltip="Save Project" onClick={saveProject}>
        💾 Save
      </button>
      <button className="btn btn--ghost tooltip" data-tooltip="Load Project" onClick={loadProject}>
        📂 Load
      </button>

      <div className="separator" />

      {/* Clear */}
      <button
        className="btn btn--ghost tooltip"
        data-tooltip="Clear Canvas"
        onClick={() => {
          if (componentCount === 0 || window.confirm('Clear all elements?')) {
            clearCanvas();
          }
        }}
        style={{ color: componentCount > 0 ? 'var(--error)' : undefined }}
      >
        🗑
      </button>

      {/* Export */}
      <button className="btn btn--accent tooltip" data-tooltip="Export React Code" onClick={toggleCodePreview}>
        ⟨/⟩ Export
      </button>
    </div>
  );
}
