import { useState } from 'react';
import useStore from '../store/useStore';
import { COMPONENT_DEFAULTS, CATEGORIES } from '../utils/defaults';
import './ComponentPalette.css';

export default function ComponentPalette() {
  const setDraggedType = useStore((s) => s.setDraggedType);
  const clearDraggedType = useStore((s) => s.clearDraggedType);
  const [expandedCats, setExpandedCats] = useState(
    () => new Set(CATEGORIES.map((c) => c.id))
  );

  const toggleCat = (id) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragStart = (e, type) => {
    setDraggedType(type);
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.effectAllowed = 'copy';

    // Create a small drag preview
    const ghost = document.createElement('div');
    ghost.className = 'palette-drag-ghost';
    ghost.textContent = COMPONENT_DEFAULTS[type].label;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 40, 18);
    requestAnimationFrame(() => ghost.remove());
  };

  const handleDragEnd = () => {
    clearDraggedType();
  };

  // Group components by category
  const grouped = {};
  Object.entries(COMPONENT_DEFAULTS).forEach(([type, def]) => {
    if (!grouped[def.category]) grouped[def.category] = [];
    grouped[def.category].push({ type, ...def });
  });

  return (
    <div className="panel panel--left animate-slide-left">
      <div className="panel__header">
        <span className="panel__title">Components</span>
      </div>

      <div className="panel__body palette-body">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="palette-category">
            <button
              className="palette-category__header"
              onClick={() => toggleCat(cat.id)}
              aria-expanded={expandedCats.has(cat.id)}
            >
              <span className="palette-category__icon">{cat.icon}</span>
              <span className="palette-category__label">{cat.label}</span>
              <span
                className={`palette-category__chevron ${
                  expandedCats.has(cat.id) ? 'open' : ''
                }`}
              >
                ›
              </span>
            </button>

            {expandedCats.has(cat.id) && grouped[cat.id] && (
              <div className="palette-items">
                {grouped[cat.id].map((item) => (
                  <div
                    key={item.type}
                    className="palette-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="palette-item__icon">{item.icon}</span>
                    <span className="palette-item__label">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
