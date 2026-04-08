/* ─────────────────────────────────────────────
   Code Generator
   Traverses the component tree and outputs
   clean React JSX + inline styles.
   ───────────────────────────────────────────── */

/**
 * Generate a React functional component from the store state.
 * @param {Object} components - flat component map
 * @param {string[]} componentOrder - root-level IDs
 * @param {Object} canvasSettings - canvas width/height/bg
 * @param {string} mode - 'inline' | 'css-modules'
 * @returns {{ jsx: string, css: string }}
 */
export function generateCode(components, componentOrder, canvasSettings, mode = 'inline') {
  const indent = (depth) => '  '.repeat(depth);

  /* Convert a numeric-pixel style object into a JSX-compatible inline style string */
  const styleToJSX = (style, depth) => {
    const entries = Object.entries(style)
      .filter(([key]) => key !== 'position') // we handle position at parent
      .map(([key, value]) => {
        // Convert numeric values for left/top/width/height to px strings
        if (['left', 'top', 'width', 'height'].includes(key) && typeof value === 'number') {
          return `${key}: '${value}px'`;
        }
        if (typeof value === 'number') {
          return `${key}: ${value}`;
        }
        return `${key}: '${value}'`;
      });

    if (entries.length === 0) return '{}';

    return `{\n${indent(depth + 1)}${entries.join(`,\n${indent(depth + 1)}`)}\n${indent(depth)}}`;
  };

  /* Render a single component to JSX */
  const renderComponent = (comp, depth) => {
    const { type, style, props: compProps, children } = comp;
    const pad = indent(depth);
    const styleStr = styleToJSX({ position: 'absolute', ...style }, depth + 1);

    // Get child JSX
    const childJSX = children
      .map((cid) => components[cid])
      .filter(Boolean)
      .map((child) => renderComponent(child, depth + 1))
      .join('\n');

    const textContent = compProps.text || '';

    switch (type) {
      case 'div':
      case 'section': {
        const tag = type === 'div' ? 'div' : 'section';
        if (childJSX) {
          return `${pad}<${tag} style={${styleStr}}>\n${childJSX}\n${pad}</${tag}>`;
        }
        return `${pad}<${tag} style={${styleStr}} />`;
      }

      case 'heading': {
        const tag = `h${compProps.level || 1}`;
        return `${pad}<${tag} style={${styleStr}}>${textContent}</${tag}>`;
      }

      case 'paragraph':
        return `${pad}<p style={${styleStr}}>${textContent}</p>`;

      case 'span':
        return `${pad}<span style={${styleStr}}>${textContent}</span>`;

      case 'link':
        return `${pad}<a href="${compProps.href || '#'}" style={${styleStr}}>${textContent}</a>`;

      case 'button':
        return `${pad}<button style={${styleStr}}>${textContent}</button>`;

      case 'input':
        return `${pad}<input type="text" placeholder="${compProps.placeholder || ''}" style={${styleStr}} />`;

      case 'textarea':
        return `${pad}<textarea placeholder="${compProps.placeholder || ''}" style={${styleStr}} />`;

      case 'select': {
        const options = (compProps.options || [])
          .map((opt) => `${pad}  <option>${opt}</option>`)
          .join('\n');
        return `${pad}<select style={${styleStr}}>\n${options}\n${pad}</select>`;
      }

      case 'image':
        return `${pad}<img src="${compProps.src || ''}" alt="${compProps.alt || ''}" style={${styleStr}} />`;

      case 'navbar': {
        const links = (compProps.links || [])
          .map((link) => `${pad}    <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>${link}</a>`)
          .join('\n');
        return `${pad}<nav style={${styleStr}}>
${pad}  <span style={{ fontWeight: 700, fontSize: '16px' }}>${compProps.text || 'Brand'}</span>
${pad}  <div style={{ display: 'flex', gap: '20px' }}>
${links}
${pad}  </div>
${pad}</nav>`;
      }

      case 'card':
        return `${pad}<div style={${styleStr}}>
${pad}  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>${textContent}</h3>
${pad}  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Card content goes here</p>
${pad}</div>`;

      default:
        return `${pad}<div style={${styleStr}}>${textContent}</div>`;
    }
  };

  /* Build the full component */
  const rootChildren = componentOrder
    .map((id) => components[id])
    .filter(Boolean)
    .map((comp) => renderComponent(comp, 2))
    .join('\n');

  const jsx = `import React from 'react';

const MyDesign = () => {
  return (
    <div style={{
      position: 'relative',
      width: '${canvasSettings.width}px',
      height: '${canvasSettings.height}px',
      backgroundColor: '${canvasSettings.backgroundColor}',
      overflow: 'hidden',
    }}>
${rootChildren}
    </div>
  );
};

export default MyDesign;
`;

  return { jsx, css: '' };
}
