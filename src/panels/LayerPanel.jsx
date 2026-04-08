import useStore from '../store/useStore';
import './LayerPanel.css';

export default function LayerPanel() {
  const components = useStore((s) => s.components);
  const componentOrder = useStore((s) => s.componentOrder);
  const selectedId = useStore((s) => s.selectedId);
  const selectComponent = useStore((s) => s.selectComponent);
  const updateComponent = useStore((s) => s.updateComponent);
  const deleteComponent = useStore((s) => s.deleteComponent);

  const rootComponents = componentOrder
    .map((id) => components[id])
    .filter(Boolean);

  const renderLayer = (comp, depth = 0) => {
    const isSelected = selectedId === comp.id;
    const childComps = (comp.children || [])
      .map((cid) => components[cid])
      .filter(Boolean);

    return (
      <div key={comp.id} className="layer-item-wrapper">
        <div
          className={`layer-item ${isSelected ? 'layer-item--selected' : ''}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => selectComponent(comp.id)}
        >
          <span className="layer-item__icon">
            {comp.children?.length > 0 ? '▸' : '·'}
          </span>
          <span className="layer-item__name">{comp.name || comp.type}</span>
          <span className="layer-item__type">{comp.type}</span>

          <div className="layer-item__actions">
            <button
              className="layer-action-btn tooltip"
              data-tooltip={comp.visible ? 'Hide' : 'Show'}
              onClick={(e) => {
                e.stopPropagation();
                updateComponent(comp.id, { visible: !comp.visible });
              }}
            >
              {comp.visible ? '👁' : '🚫'}
            </button>
            <button
              className="layer-action-btn tooltip"
              data-tooltip={comp.locked ? 'Unlock' : 'Lock'}
              onClick={(e) => {
                e.stopPropagation();
                updateComponent(comp.id, { locked: !comp.locked });
              }}
            >
              {comp.locked ? '🔒' : '🔓'}
            </button>
            <button
              className="layer-action-btn layer-action-btn--delete tooltip"
              data-tooltip="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteComponent(comp.id);
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Render children */}
        {childComps.map((child) => renderLayer(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="layer-panel">
      <div className="panel__header">
        <span className="panel__title">Layers</span>
        <span className="layer-count">{Object.keys(components).length}</span>
      </div>
      <div className="layer-panel__body">
        {rootComponents.length === 0 ? (
          <div className="layer-empty">No elements yet</div>
        ) : (
          [...rootComponents].reverse().map((comp) => renderLayer(comp))
        )}
      </div>
    </div>
  );
}
