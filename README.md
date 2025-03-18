# 3D Card Pack Opening Experience

![Pack Opening Demo](https://github.com/Ren4issance/packs-3d/assets/34111582/your-future-demo-image-id)

An immersive and interactive 3D card pack opening experience built with React Three Fiber, Next UI, and TypeScript. This project demonstrates advanced 3D animations and interactions in a web browser, providing a realistic simulation of opening a pack of cards.

## ✨ Features

- **Realistic 3D Pack Opening Animation**: Smooth animations with controlled timing for opening packs
- **Interactive Card Reveal Sequence**: Cards are revealed one by one with dramatic animations
- **Card Inspection**: Examine cards up close with intuitive 3D rotation controls
- **Different Card Rarities**: Visual effects that distinguish between common, rare, and legendary cards
- **Responsive Design**: Works across desktop and mobile devices
- **Physics-Based Animation**: Natural-feeling animations with realistic physics
- **Touch & Mouse Controls**: Intuitive controls for both touch and mouse input

## 🛠️ Technologies Used

- **[React](https://reactjs.org/)**: UI component library
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Three.js](https://threejs.org/)**: 3D rendering engine
- **[React Three Fiber](https://github.com/pmndrs/react-three-fiber)**: React renderer for Three.js
- **[React Three Drei](https://github.com/pmndrs/drei)**: Useful helpers for React Three Fiber
- **[Next UI](https://nextui.org/)**: Beautiful, modern UI components
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Vite](https://vitejs.dev/)**: Frontend build tool

## 🚀 Live Demo

Check out the live demo at [https://ren4issance.github.io/packs-3d](https://ren4issance.github.io/packs-3d) (coming soon)

## 🏁 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ren4issance/packs-3d.git
cd packs-3d
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 Usage

- **Opening a Pack**: Click on the pack to start the opening animation
- **Viewing Cards**: After the pack opens, cards will be revealed one by one
- **Inspecting a Card**: Click on a card to inspect it in 3D
  - **Rotate**: Click and drag to rotate the card in 3D space
  - **Zoom**: Use mouse wheel or pinch gesture to zoom in/out
  - **Exit Inspection**: Click outside the card or use the close button

## 📁 Project Structure

```
src/
├── components/
│   ├── pack-opening.tsx        # Main pack opening component
│   └── ui/                     # UI components
│       └── button.tsx          # Button component
├── lib/
│   └── utils.ts                # Utility functions
├── App.tsx                     # Main application component
└── main.tsx                    # Application entry point
```

## 🧪 Key Code Examples

### Pack Opening Animation

```tsx
function Pack({ opened, setOpened }: PackProps) {
  // Animation logic for the pack opening
  useFrame((state, delta) => {
    if (opened) {
      // Opening animation logic
      const openingProgress = Math.min(
        (state.clock.elapsedTime - animationStartTime) / openingDuration,
        1
      );

      // Position and opacity animation based on progress
      packGroupRef.current.position.y = THREE.MathUtils.damp(
        packGroupRef.current.position.y,
        openingProgress * -5,
        10,
        delta
      );

      // More animation logic...
    }
  });

  // Component rendering...
}
```

## 🧩 Advanced Features

### Card Rarity System

The project includes a system for different card rarities, each with unique visual effects:

- **Common Cards**: Standard cards with basic styling
- **Rare Cards**: Enhanced glow effects and subtle particle emissions
- **Legendary Cards**: Premium animated backgrounds and prominent visual effects

### Physics-Based Animation

Using Three.js physics helpers, cards have natural movement with realistic physics:

- Gravity affects how cards fall
- Collisions between cards create realistic bouncing
- Air resistance adds subtle motion to floating cards

## 🔧 Configuration

You can customize various aspects of the pack opening experience:

- Animation timing
- Physics properties
- Visual effects
- Card designs

Modify the constants at the top of `src/components/pack-opening.tsx` to adjust these parameters.

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js for providing the powerful 3D rendering engine
- React Three Fiber for making Three.js reactive
- Next UI for beautiful UI components
- The React and TypeScript communities
- Inspiration from modern card games like Hearthstone and Magic: The Gathering Arena

## 📬 Contact

For any questions or feedback, please reach out or create an issue on GitHub.

---

Made with ❤️ by [Ren4issance](https://github.com/Ren4issance)
