<div align="center">
  <img src="public/webcraft-cover.svg" width="100%" alt="WebCraft - The React Visual Builder" />
  <p>
    <strong>Design modern, responsive web layouts visually and instantly export clean React code.</strong>
  </p>
  
  <p>
    <a href="#-features">Features</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white&style=for-the-badge" alt="Vite" />
    <img src="https://img.shields.io/badge/Zustand-5.0-black?logo=react&style=for-the-badge" alt="Zustand" />
  </p>

</div>

<hr/>

## What is WebCraft?

WebCraft is a powerful, drag-and-drop website design tool built specifically for React developers. Instead of writing boilerplate layout code manually, WebCraft allows you to assemble UI components on an interactive canvas, deeply configure their styles and properties, and immediately copy the resulting functional React component to use in your project.

It bridges the gap between no-code design tools and production-grade developer environments.

<br/>

## Features

- **Intelligent Drag-and-Drop Canvas:** Seamlessly build complex document structures by dragging components onto an interactive workspace.
- **Rich Component Palette:** Access a wide variety of pre-styled structural containers and atomic UI elements (Text, Buttons, Inputs, Images).
- **Granular Properties Panel:** Fine-tune the styling, typography, spacing, colors, and raw HTML attributes for any selected component.
- **Live React Code Generation:** Your visual layout is continuously compiled into clean, modern, and reusable React code.
- **Blazing Fast Performance:** Powered by Vite and Zustand to ensure zero lag, even with hundreds of DOM elements on the canvas.

<br/>

## How It Works

1. **Select Component:** Choose elements from the left-hand Component Palette.
2. **Build Layout:** Drag them onto the central Canvas area. Organize them sequentially or nest them inside containers.
3. **Style & Configure:** Click any element on the Canvas to open the right-hand Properties Panel. Tweak styles, colors, padding, and text.
4. **Export Code:** Open the Code Panel to instantly copy the generated `JSX` / React Component and paste it straight into your source code.

<br/>

## Project Architecture

WebCraft is thoughtfully engineered into decoupled, scalable modules:

| Directory            | Purpose                                                          |
| :------------------- | :--------------------------------------------------------------- |
| 📁 `src/components/` | The atomic UI building blocks (Buttons, Containers, Text)        |
| 📁 `src/canvas/`     | The core drag-and-drop engine and interactive workspace          |
| 📁 `src/panels/`     | The sidebar interfaces (Palette & Properties)                    |
| 📁 `src/codegen/`    | Custom engine that converts the JSON tree into React source code |
| 📁 `src/store/`      | Global Zustand state managing the active DOM tree and selections |

<br/>

## Getting Started

### Prerequisites

Make sure you have Node.js 18+ installed.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MGM50/WEBCRAFT.git
   cd WEBCRAFT
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Visit the app**
   Open `http://localhost:5173` in your browser and start building!

<hr/>
