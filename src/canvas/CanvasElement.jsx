import { useRef, useState, useCallback } from 'react';
import useStore from '../store/useStore';
import './CanvasElement.css';

const HANDLE_SIZE = 8;

export default function CanvasElement({ component }) {
  const elRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const selectedId = useStore((s) => s.selectedId);
  const hoveredId = useStore((s) => s.hoveredId);
  const zoom = useStore((s) => s.canvasSettings.zoom);
  const selectComponent = useStore((s) => s.selectComponent);
  const setHovered = useStore((s) => s.setHovered);
  const moveComponent = useStore((s) => s.moveComponent);
  const resizeComponent = useStore((s) => s.resizeComponent);
  const updateComponent = useStore((s) => s.updateComponent);
  const components = useStore((s) => s.components);

  const { id, type, style, props, children, locked, visible } = component;
  const isSelected = selectedId === id;
  const isHovered = hoveredId === id;

  if (!visible) return null;

  /* ── Click to select ─────────────────── */
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      selectComponent(id);
    },
    [id, selectComponent],
  );

  /* ── Double-click to edit text ────────── */
  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (['heading', 'paragraph', 'span', 'button', 'link'].includes(type)) {
        setIsEditing(true);
      }
    },
    [type],
  );

  const handleTextBlur = useCallback(
    (e) => {
      setIsEditing(false);
      updateComponent(id, { props: { text: e.target.innerText } });
    },
    [id, updateComponent],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.target.blur();
      }
    },
    [],
  );

  /* ── Drag to move ────────────────────── */
  const handleMouseDown = useCallback(
    (e) => {
      if (locked || isEditing || e.button !== 0) return;
      e.stopPropagation();
      selectComponent(id);

      const startX = e.clientX;
      const startY = e.clientY;
      const origLeft = style.left || 0;
      const origTop = style.top || 0;

      const onMove = (moveE) => {
        setIsDragging(true);
        const dx = (moveE.clientX - startX) / zoom;
        const dy = (moveE.clientY - startY) / zoom;
        moveComponent(id, origLeft + dx, origTop + dy);
      };

      const onUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, style.left, style.top, zoom, locked, isEditing, selectComponent, moveComponent],
  );

  /* ── Resize handles ──────────────────── */
  const handleResizeStart = useCallback(
    (e, handle) => {
      e.stopPropagation();
      e.preventDefault();
      if (locked) return;

      selectComponent(id);
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const origW = style.width || 100;
      const origH = style.height || 100;
      const origL = style.left || 0;
      const origT = style.top || 0;

      const onMove = (moveE) => {
        const dx = (moveE.clientX - startX) / zoom;
        const dy = (moveE.clientY - startY) / zoom;

        let newW = origW;
        let newH = origH;
        let newL = origL;
        let newT = origT;

        // Determine resize direction
        if (handle.includes('e')) newW = origW + dx;
        if (handle.includes('w')) {
          newW = origW - dx;
          newL = origL + dx;
        }
        if (handle.includes('s')) newH = origH + dy;
        if (handle.includes('n')) {
          newH = origH - dy;
          newT = origT + dy;
        }

        resizeComponent(id, newW, newH, newL, newT);
      };

      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [id, style, zoom, locked, selectComponent, resizeComponent],
  );

  /* ── Render content based on type ────── */
  const renderContent = () => {
    const textContent = isEditing ? (
      <div
        className="ce-editable"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTextBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      >
        {props.text}
      </div>
    ) : (
      props.text || ''
    );

    switch (type) {
      case 'heading': {
        const Tag = `h${props.level || 1}`;
        return <Tag className="ce-heading">{textContent}</Tag>;
      }
      case 'paragraph':
        return <p className="ce-paragraph">{textContent}</p>;
      case 'span':
      case 'link':
        return <span className="ce-text">{textContent}</span>;
      case 'button':
        return <div className="ce-button">{textContent}</div>;
      case 'input':
        return (
          <div className="ce-input-preview">
            {props.text || props.placeholder || 'Input'}
          </div>
        );
      case 'textarea':
        return (
          <div className="ce-textarea-preview">
            {props.text || props.placeholder || 'Textarea'}
          </div>
        );
      case 'select':
        return (
          <div className="ce-select-preview">
            {props.text || 'Select...'} <span className="ce-select-arrow">▾</span>
          </div>
        );
      case 'image':
        return props.src ? (
          <img src={props.src} alt={props.alt || ''} className="ce-image" />
        ) : (
          <div className="ce-image-placeholder">
            <span>🖼</span>
            <span>Image</span>
          </div>
        );
      case 'navbar':
        return (
          <div className="ce-navbar">
            <span className="ce-navbar__brand">{props.text || 'Brand'}</span>
            <div className="ce-navbar__links">
              {(props.links || []).map((link, i) => (
                <span key={i} className="ce-navbar__link">{link}</span>
              ))}
            </div>
          </div>
        );
      case 'card':
        return (
          <div className="ce-card">
            <div className="ce-card__title">{props.text || 'Card'}</div>
            <div className="ce-card__body">Card content goes here</div>
          </div>
        );
      default:
        return null;
    }
  };

  /* ── Render children ─────────────────── */
  const childComponents = children
    .map((cid) => components[cid])
    .filter(Boolean);

  /* ── Build inline style ──────────────── */
  const elementStyle = {
    ...style,
    left: `${style.left}px`,
    top: `${style.top}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
  };

  // Remove numeric-only values from style to avoid React warnings
  delete elementStyle.position;

  const resizeHandles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

  return (
    <div
      ref={elRef}
      className={`canvas-element ${isSelected ? 'selected' : ''} ${
        isHovered && !isSelected ? 'hovered' : ''
      } ${isDragging ? 'dragging' : ''} ${locked ? 'locked' : ''}`}
      style={{ position: 'absolute', ...elementStyle }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Component content */}
      <div className="canvas-element__content">
        {renderContent()}
      </div>

      {/* Child components */}
      {childComponents.map((childComp) => (
        <CanvasElement key={childComp.id} component={childComp} />
      ))}

      {/* Selection overlay with resize handles */}
      {isSelected && !locked && (
        <>
          <div className="canvas-element__selection-border" />
          {resizeHandles.map((handle) => (
            <div
              key={handle}
              className={`resize-handle resize-handle--${handle}`}
              onMouseDown={(e) => handleResizeStart(e, handle)}
            />
          ))}
          {/* Size label */}
          <div className="canvas-element__size-label">
            {Math.round(style.width)} × {Math.round(style.height)}
          </div>
        </>
      )}
    </div>
  );
}
