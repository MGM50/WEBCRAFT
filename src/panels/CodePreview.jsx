import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useStore from '../store/useStore';
import { generateCode } from '../codegen/codeGenerator';
import './CodePreview.css';

export default function CodePreview() {
  const components = useStore((s) => s.components);
  const componentOrder = useStore((s) => s.componentOrder);
  const canvasSettings = useStore((s) => s.canvasSettings);
  const toggleCodePreview = useStore((s) => s.toggleCodePreview);
  const [copied, setCopied] = useState(false);

  const { jsx } = useMemo(
    () => generateCode(components, componentOrder, canvasSettings),
    [components, componentOrder, canvasSettings],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsx], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyDesign.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-preview-overlay animate-fade-in" onClick={toggleCodePreview}>
      <div className="code-preview-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="code-preview__header">
          <div className="code-preview__title">
            <span className="code-preview__icon">⟨/⟩</span>
            Export React Code
          </div>
          <div className="code-preview__actions">
            <button className="btn btn--ghost" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '⧉ Copy'}
            </button>
            <button className="btn btn--accent" onClick={handleDownload}>
              ↓ Download .jsx
            </button>
            <button className="btn btn--ghost btn--icon" onClick={toggleCodePreview}>
              ✕
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="code-preview__body">
          <SyntaxHighlighter
            language="jsx"
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: '#0d1117',
              fontSize: '13px',
              lineHeight: '1.6',
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              height: '100%',
            }}
            showLineNumbers
            wrapLongLines
          >
            {jsx}
          </SyntaxHighlighter>
        </div>

        {/* Footer */}
        <div className="code-preview__footer">
          <span className="code-preview__footer-text">
            {Object.keys(components).length} components • React JSX with inline styles
          </span>
        </div>
      </div>
    </div>
  );
}
