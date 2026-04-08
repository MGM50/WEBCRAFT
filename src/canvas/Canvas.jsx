import { useRef, useCallback, useEffect } from 'react';
import useStore from '../store/useStore';
import CanvasElement from './CanvasElement';
import './Canvas.css';

export default function Canvas() {
  const canvasRef = useRef(null);
  const innerRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const components = useStore((s) => s.components);
  const componentOrder = useStore((s) => s.componentOrder);
  const selectedId = useStore((s) => s.selectedId);
  const canvasSettings = useStore((s) => s.canvasSettings);
  const addComponent = useStore((s) => s.addComponent);
  const clearSelection = useStore((s) => s.clearSelection);
  const clearDraggedType = useStore((s) => s.clearDraggedType);
  const setZoom = useStore((s) => s.setZoom);
  const setPan = useStore((s) => s.setPan);

  const { width, height, backgroundColor, zoom, panX, panY, gridEnabled, gridSize } =
    canvasSettings;

  /* ── Drop handling ────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('component-type');
      if (!type) return;

      // Calculate position relative to the canvas inner surface
      const rect = innerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Snap to grid
      const { snapToGrid, gridSize } = useStore.getState().canvasSettings;
      const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
      const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

      addComponent(type, snappedX, snappedY);
      clearDraggedType();
    },
    [addComponent, clearDraggedType, zoom],
  );

  /* ── Click on empty canvas → deselect ── */
  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === innerRef.current || e.target === canvasRef.current) {
        clearSelection();
      }
    },
    [clearSelection],
  );

  /* ── Zoom with Ctrl+Scroll ──────────── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        setZoom(useStore.getState().canvasSettings.zoom + delta);
      } else {
        // Pan with scroll
        const state = useStore.getState();
        setPan(
          state.canvasSettings.panX - e.deltaX,
          state.canvasSettings.panY - e.deltaY,
        );
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoom, setPan]);

  /* ── Middle-click pan ───────────────── */
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1) {
        // Middle click
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
        canvasRef.current.style.cursor = 'grabbing';
      }
    },
    [panX, panY],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning.current) {
        setPan(
          e.clientX - panStart.current.x,
          e.clientY - panStart.current.y,
        );
      }
    },
    [setPan],
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      canvasRef.current.style.cursor = '';
    }
  }, []);

  /* ── Grid pattern ───────────────────── */
  const gridBg = gridEnabled
    ? {
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  /* ── Render root components recursively ─ */
  const rootComponents = componentOrder
    .map((id) => components[id])
    .filter(Boolean);

  return (
    <div
      ref={canvasRef}
      className="canvas-area"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom / Pan info badge */}
      <div className="canvas-info-badge">
        {Math.round(zoom * 100)}%
      </div>

      {/* The actual design surface */}
      <div
        ref={innerRef}
        className="canvas-surface"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
          ...gridBg,
        }}
      >
        {rootComponents.map((comp) => (
          <CanvasElement key={comp.id} component={comp} />
        ))}
      </div>

      {/* Empty state */}
      {rootComponents.length === 0 && (
        <div className="canvas-empty">
          <div className="canvas-empty__icon">⊕</div>
          <div className="canvas-empty__text">
            Drag components from the left panel onto the canvas
          </div>
          <div className="canvas-empty__hint">
            or double-click a component to add it to center
          </div>
        </div>
      )}
    </div>
  );
}
