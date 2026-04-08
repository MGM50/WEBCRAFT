import Toolbar from './components/Toolbar';
import ComponentPalette from './panels/ComponentPalette';
import Canvas from './canvas/Canvas';
import PropertiesPanel from './panels/PropertiesPanel';
import LayerPanel from './panels/LayerPanel';
import CodePreview from './panels/CodePreview';
import useStore from './store/useStore';
import useKeyboardShortcuts from './utils/useKeyboardShortcuts';

export default function App() {
  const showCodePreview = useStore((s) => s.showCodePreview);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="app-layout">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main body — 3 columns */}
      <div className="app-body">
        {/* Left sidebar: Component Palette + Layers */}
        <div className="app-sidebar-left">
          <ComponentPalette />
          <LayerPanel />
        </div>

        {/* Center: Canvas */}
        <Canvas />

        {/* Right sidebar: Properties */}
        <PropertiesPanel />
      </div>

      {/* Code Preview modal */}
      {showCodePreview && <CodePreview />}
    </div>
  );
}
