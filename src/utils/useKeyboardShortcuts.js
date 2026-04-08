import { useEffect } from 'react';
import useStore from '../store/useStore';

/**
 * Global keyboard shortcuts for the editor.
 * Mount once in App.jsx.
 */
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      const state = useStore.getState();
      const {
        selectedId,
        deleteComponent,
        duplicateComponent,
        copyComponent,
        pasteComponent,
        undo,
        redo,
        moveComponent,
        selectComponent,
        clearSelection,
        components,
        componentOrder,
      } = state;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Don't capture when typing in inputs
      const tag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (e.target.isContentEditable) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedId) {
            e.preventDefault();
            deleteComponent(selectedId);
          }
          break;

        case 'c':
          if (isCtrl && selectedId) {
            e.preventDefault();
            copyComponent(selectedId);
          }
          break;

        case 'v':
          if (isCtrl) {
            e.preventDefault();
            pasteComponent();
          }
          break;

        case 'x':
          if (isCtrl && selectedId) {
            e.preventDefault();
            copyComponent(selectedId);
            deleteComponent(selectedId);
          }
          break;

        case 'd':
          if (isCtrl && selectedId) {
            e.preventDefault();
            duplicateComponent(selectedId);
          }
          break;

        case 'z':
          if (isCtrl && isShift) {
            e.preventDefault();
            redo();
          } else if (isCtrl) {
            e.preventDefault();
            undo();
          }
          break;

        case 'Z':
          if (isCtrl) {
            e.preventDefault();
            redo();
          }
          break;

        case 'a':
          if (isCtrl) {
            e.preventDefault();
            // Select first component if none selected
            if (componentOrder.length > 0) {
              selectComponent(componentOrder[0]);
            }
          }
          break;

        case 'Escape':
          clearSelection();
          break;

        // Arrow key nudging
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (!selectedId) break;
          e.preventDefault();
          const comp = components[selectedId];
          if (!comp || comp.locked) break;

          const step = isShift ? 10 : 1;
          let newLeft = comp.style.left || 0;
          let newTop = comp.style.top || 0;

          if (e.key === 'ArrowUp') newTop -= step;
          if (e.key === 'ArrowDown') newTop += step;
          if (e.key === 'ArrowLeft') newLeft -= step;
          if (e.key === 'ArrowRight') newLeft += step;

          moveComponent(selectedId, newLeft, newTop);
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
