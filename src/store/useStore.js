import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { COMPONENT_DEFAULTS } from '../utils/defaults';

/* ───────────────────────────────────────────
   Undo / Redo middleware
   ─────────────────────────────────────────── */
const withHistory = (config) => (set, get, api) =>
  config(
    (partial) => {
      const state = get();
      // Save current components snapshot before mutation
      if (typeof partial === 'function') {
        const next = partial(state);
        if (next.components && next.components !== state.components) {
          set({
            history: {
              past: [...state.history.past.slice(-50), state.components],
              future: [],
            },
          });
        }
        set(next);
      } else {
        if (partial.components && partial.components !== state.components) {
          set({
            history: {
              past: [...state.history.past.slice(-50), state.components],
              future: [],
            },
          });
        }
        set(partial);
      }
    },
    get,
    api,
  );

/* ───────────────────────────────────────────
   Store
   ─────────────────────────────────────────── */
const useStore = create(
  withHistory((set, get) => ({
    /* ── State ───────────────────────── */
    components: {},
    componentOrder: [],  // root-level ordering
    selectedId: null,
    hoveredId: null,
    clipboard: null,
    draggedType: null,   // component type being dragged from palette

    history: {
      past: [],
      future: [],
    },

    canvasSettings: {
      width: 1440,
      height: 900,
      backgroundColor: '#ffffff',
      zoom: 1,
      panX: 0,
      panY: 0,
      gridEnabled: true,
      snapToGrid: true,
      gridSize: 8,
    },

    // UI state
    showCodePreview: false,
    showLayerPanel: true,

    /* ── Actions ─────────────────────── */

    // --- Selection ---
    selectComponent: (id) => set({ selectedId: id }),
    clearSelection: () => set({ selectedId: null }),
    setHovered: (id) => set({ hoveredId: id }),

    // --- Drag from palette ---
    setDraggedType: (type) => set({ draggedType: type }),
    clearDraggedType: () => set({ draggedType: null }),

    // --- Add component ---
    addComponent: (type, x, y, parentId = null) => {
      const defaults = COMPONENT_DEFAULTS[type];
      if (!defaults) return;

      const id = nanoid(10);
      const newComponent = {
        id,
        type,
        parentId,
        children: [],
        props: { ...defaults.defaultProps },
        style: {
          position: 'absolute',
          left: x,
          top: y,
          ...defaults.defaultStyle,
        },
        locked: false,
        visible: true,
        name: `${defaults.label}`,
      };

      set((state) => {
        const next = { ...state.components, [id]: newComponent };
        let nextOrder = [...state.componentOrder];

        if (parentId && state.components[parentId]) {
          // Add as child
          const parent = { ...state.components[parentId] };
          parent.children = [...parent.children, id];
          next[parentId] = parent;
        } else {
          nextOrder.push(id);
        }

        return {
          components: next,
          componentOrder: nextOrder,
          selectedId: id,
        };
      });

      return id;
    },

    // --- Update component ---
    updateComponent: (id, changes) => {
      set((state) => {
        const comp = state.components[id];
        if (!comp) return state;

        return {
          components: {
            ...state.components,
            [id]: {
              ...comp,
              ...changes,
              style: changes.style
                ? { ...comp.style, ...changes.style }
                : comp.style,
              props: changes.props
                ? { ...comp.props, ...changes.props }
                : comp.props,
            },
          },
        };
      });
    },

    // --- Move component (position) ---
    moveComponent: (id, left, top) => {
      set((state) => {
        const comp = state.components[id];
        if (!comp || comp.locked) return state;

        const { snapToGrid, gridSize } = state.canvasSettings;
        let newLeft = left;
        let newTop = top;

        if (snapToGrid) {
          newLeft = Math.round(left / gridSize) * gridSize;
          newTop = Math.round(top / gridSize) * gridSize;
        }

        return {
          components: {
            ...state.components,
            [id]: {
              ...comp,
              style: { ...comp.style, left: newLeft, top: newTop },
            },
          },
        };
      });
    },

    // --- Resize component ---
    resizeComponent: (id, width, height, left, top) => {
      set((state) => {
        const comp = state.components[id];
        if (!comp || comp.locked) return state;

        const newStyle = { ...comp.style };
        if (width !== undefined) newStyle.width = Math.max(20, width);
        if (height !== undefined) newStyle.height = Math.max(20, height);
        if (left !== undefined) newStyle.left = left;
        if (top !== undefined) newStyle.top = top;

        return {
          components: {
            ...state.components,
            [id]: { ...comp, style: newStyle },
          },
        };
      });
    },

    // --- Delete component ---
    deleteComponent: (id) => {
      set((state) => {
        if (!state.components[id]) return state;

        const comp = state.components[id];
        const next = { ...state.components };

        // Recursively delete children
        const deleteRecursive = (cid) => {
          const c = next[cid];
          if (c && c.children) {
            c.children.forEach(deleteRecursive);
          }
          delete next[cid];
        };
        deleteRecursive(id);

        // Remove from parent's children array
        if (comp.parentId && next[comp.parentId]) {
          const parent = { ...next[comp.parentId] };
          parent.children = parent.children.filter((c) => c !== id);
          next[comp.parentId] = parent;
        }

        return {
          components: next,
          componentOrder: state.componentOrder.filter((c) => c !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        };
      });
    },

    // --- Duplicate component ---
    duplicateComponent: (id) => {
      const state = get();
      const comp = state.components[id];
      if (!comp) return;

      const newId = nanoid(10);
      const clone = {
        ...comp,
        id: newId,
        children: [],
        name: `${comp.name} copy`,
        style: {
          ...comp.style,
          left: (comp.style.left || 0) + 20,
          top: (comp.style.top || 0) + 20,
        },
      };

      set((state) => ({
        components: { ...state.components, [newId]: clone },
        componentOrder: [...state.componentOrder, newId],
        selectedId: newId,
      }));
    },

    // --- Copy / Paste ---
    copyComponent: (id) => {
      const comp = get().components[id];
      if (comp) set({ clipboard: { ...comp } });
    },

    pasteComponent: () => {
      const state = get();
      if (!state.clipboard) return;

      const newId = nanoid(10);
      const pasted = {
        ...state.clipboard,
        id: newId,
        children: [],
        style: {
          ...state.clipboard.style,
          left: (state.clipboard.style.left || 0) + 30,
          top: (state.clipboard.style.top || 0) + 30,
        },
      };

      set((state) => ({
        components: { ...state.components, [newId]: pasted },
        componentOrder: [...state.componentOrder, newId],
        selectedId: newId,
      }));
    },

    // --- Undo / Redo ---
    undo: () => {
      const { history, components } = get();
      if (history.past.length === 0) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);

      set({
        components: previous,
        selectedId: null,
        history: {
          past: newPast,
          future: [components, ...history.future],
        },
      });
    },

    redo: () => {
      const { history, components } = get();
      if (history.future.length === 0) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);

      set({
        components: next,
        selectedId: null,
        history: {
          past: [...history.past, components],
          future: newFuture,
        },
      });
    },

    // --- Canvas settings ---
    updateCanvasSettings: (changes) => {
      set((state) => ({
        canvasSettings: { ...state.canvasSettings, ...changes },
      }));
    },

    setZoom: (zoom) => {
      set((state) => ({
        canvasSettings: {
          ...state.canvasSettings,
          zoom: Math.max(0.1, Math.min(3, zoom)),
        },
      }));
    },

    setPan: (panX, panY) => {
      set((state) => ({
        canvasSettings: { ...state.canvasSettings, panX, panY },
      }));
    },

    // --- UI toggles ---
    toggleCodePreview: () =>
      set((state) => ({ showCodePreview: !state.showCodePreview })),
    toggleLayerPanel: () =>
      set((state) => ({ showLayerPanel: !state.showLayerPanel })),

    // --- Save / Load (localStorage) ---
    saveProject: () => {
      const { components, componentOrder, canvasSettings } = get();
      const data = { components, componentOrder, canvasSettings };
      localStorage.setItem('webcraft-project', JSON.stringify(data));
    },

    loadProject: () => {
      const raw = localStorage.getItem('webcraft-project');
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        set({
          components: data.components || {},
          componentOrder: data.componentOrder || [],
          canvasSettings: {
            ...get().canvasSettings,
            ...data.canvasSettings,
          },
          selectedId: null,
          history: { past: [], future: [] },
        });
        return true;
      } catch {
        return false;
      }
    },

    // --- Clear canvas ---
    clearCanvas: () => {
      set((state) => ({
        components: {},
        componentOrder: [],
        selectedId: null,
      }));
    },
  })),
);

export default useStore;
