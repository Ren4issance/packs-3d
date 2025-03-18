"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Html,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { easing } from "maath";
import * as THREE from "three";

export default function PackOpening() {
  const [opened, setOpened] = useState(false);
  const [inspectedCard, setInspectedCard] = useState(null);

  const handleInspectCard = (cardId) => {
    setInspectedCard(cardId);
  };

  const closeInspection = () => {
    setInspectedCard(null);
  };

  return (
    <div className="relative h-screen w-full bg-black">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />

        <Pack opened={opened} setOpened={setOpened} />

        <Cards
          opened={opened}
          inspectedCard={inspectedCard}
          onInspect={handleInspectCard}
        />
      </Canvas>

      {inspectedCard && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"
          onClick={closeInspection}
        >
          <div className="absolute top-5 right-5">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={closeInspection}
            >
              Close
            </Button>
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center text-white/50 text-sm">
            Click and drag to rotate card
          </div>
        </div>
      )}
    </div>
  );
}

function Pack({ opened, setOpened }) {
  const packRef = useRef();
  const texture = useTexture("/placeholder.svg?height=512&width=512");

  const handlePackClick = () => {
    if (!opened) {
      setOpened(true);
    }
  };

  useFrame((state, delta) => {
    if (opened) {
      // Animate pack opening
      easing.damp3(packRef.current.scale, [0, 0, 0], 0.4, delta);
      easing.damp3(packRef.current.position, [0, -5, 0], 0.4, delta);
      easing.dampE(packRef.current.rotation, [0, Math.PI, 0], 0.4, delta);
    } else {
      // Hover animation
      const t = state.clock.getElapsedTime();
      packRef.current.rotation.y = Math.sin(t / 2) * 0.1;
      packRef.current.position.y = Math.sin(t / 1.5) * 0.2;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      enabled={!opened}
    >
      <mesh
        ref={packRef}
        castShadow
        receiveShadow
        onClick={handlePackClick}
        // Add cursor style to indicate it's clickable
        onPointerOver={(e) => (document.body.style.cursor = "pointer")}
        onPointerOut={(e) => (document.body.style.cursor = "default")}
      >
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial
          map={texture}
          color="#4f46e5"
          roughness={0.3}
          metalness={0.7}
          emissive="#4f46e5"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function Cards({ opened, inspectedCard, onInspect }) {
  const cards = [
    {
      id: 1,
      rarity: "common",
      position: [-2, 0, 0],
      rotation: [0.1, -0.1, 0.05],
    },
    {
      id: 2,
      rarity: "rare",
      position: [-1, 0.2, 0],
      rotation: [0.05, -0.05, -0.05],
    },
    { id: 3, rarity: "epic", position: [0, 0.4, 0], rotation: [0, 0, 0.02] },
    {
      id: 4,
      rarity: "common",
      position: [1, 0.2, 0],
      rotation: [-0.05, 0.05, 0.05],
    },
    {
      id: 5,
      rarity: "legendary",
      position: [2, 0, 0],
      rotation: [-0.1, 0.1, -0.05],
    },
  ];

  return (
    <group>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          opened={opened}
          isInspected={inspectedCard === card.id}
          onInspect={() => onInspect(card.id)}
          allCardsVisible={opened && inspectedCard === null}
        />
      ))}
    </group>
  );
}

function Card({ card, opened, isInspected, onInspect, allCardsVisible }) {
  const cardRef = useRef();
  const frontTexture = useTexture("/placeholder.svg?height=512&width=512");
  const backTexture = useTexture("/placeholder.svg?height=512&width=512");
  const { size, viewport } = useThree();
  const [rotation, setRotation] = useState([Math.PI, 0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({
    x: 0,
    y: 0,
  });

  // Set different colors based on rarity
  const colors = {
    common: "#9ca3af",
    rare: "#3b82f6",
    epic: "#8b5cf6",
    legendary: "#f59e0b",
  };

  const initialPosition = [0, 0, -0.5];
  const initialRotation = [Math.PI, 0, 0];
  const initialScale = [0, 0, 0];

  // Card details based on rarity
  const cardDetails = {
    common: "Common Card: Basic attributes and abilities.",
    rare: "Rare Card: Enhanced stats and special effects.",
    epic: "Epic Card: Powerful abilities and unique traits.",
    legendary: "Legendary Card: Game-changing powers and exceptional stats.",
  };

  // Handle mouse events for card rotation
  useEffect(() => {
    if (isInspected) {
      const handleMouseDown = (e) => {
        setIsDragging(true);
        setPreviousMousePosition({ x: e.clientX, y: e.clientY });
      };

      const handleMouseMove = (e) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          // Convert mouse movement to rotation (scale down the effect)
          const rotationSpeed = 0.005;
          setRotation([
            // Clamp X rotation to prevent card from flipping too far
            THREE.MathUtils.clamp(
              rotation[0] - deltaY * rotationSpeed,
              Math.PI - 0.5,
              Math.PI + 0.5
            ),
            rotation[1] + deltaX * rotationSpeed,
            rotation[2],
          ]);

          setPreviousMousePosition({ x: e.clientX, y: e.clientY });

          // Change cursor to indicate dragging
          document.body.style.cursor = "grabbing";
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = "grab";
      };

      // Set initial cursor
      document.body.style.cursor = "grab";

      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
      };
    }
  }, [isInspected, isDragging, previousMousePosition, rotation]);

  useFrame((state, delta) => {
    if (!opened) {
      // Keep cards hidden before pack is opened
      easing.damp3(cardRef.current.position, initialPosition, 0.4, delta);
      easing.damp3(cardRef.current.scale, initialScale, 0.4, delta);
      easing.dampE(cardRef.current.rotation, initialRotation, 0.4, delta);
    } else if (isInspected) {
      // Bring card to center and make it smaller
      easing.damp3(cardRef.current.position, [0, 0, 4], 0.2, delta);
      easing.damp3(cardRef.current.scale, [0.9, 1.35, 0.9], 0.2, delta);

      // Apply smooth rotation based on mouse interaction
      easing.dampE(cardRef.current.rotation, rotation, 0.2, delta);
    } else if (allCardsVisible) {
      // Animate cards flying out
      const delay = card.id * 0.2;
      const t = Math.max(0, state.clock.getElapsedTime() - delay);

      if (t > 0) {
        // Target position with some randomization
        const targetPos = [
          card.position[0] * 1.5,
          card.position[1] * 1.5 + 0.2,
          card.position[2] + 2,
        ];

        // Animate to target position
        easing.damp3(cardRef.current.position, targetPos, 0.2, delta);
        easing.damp3(cardRef.current.scale, [1, 1.5, 1], 0.4, delta);
        easing.dampE(
          cardRef.current.rotation,
          [card.rotation[0] + Math.PI, card.rotation[1], card.rotation[2]],
          0.4,
          delta
        );

        // Add some subtle floating animation
        cardRef.current.position.y += Math.sin(t * 1.5) * 0.0015;
        cardRef.current.rotation.z += Math.sin(t * 2) * 0.0005;
      }
    } else {
      // Move cards out of the way when another card is being inspected
      const targetPos = [card.position[0] * 3, card.position[1] * 3, -5];

      easing.damp3(cardRef.current.position, targetPos, 0.4, delta);
      easing.damp3(cardRef.current.scale, [0.5, 0.75, 0.5], 0.4, delta);
    }
  });

  return (
    <group
      ref={cardRef}
      position={initialPosition}
      rotation={initialRotation}
      scale={initialScale}
      onClick={(e) => {
        if (opened && !isInspected) {
          e.stopPropagation();
          onInspect();
        }
      }}
    >
      {/* Card front */}
      <mesh castShadow receiveShadow position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial
          map={frontTexture}
          color={colors[card.rarity]}
          roughness={0.3}
          metalness={0.7}
          emissive={colors[card.rarity]}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Card back */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, -0.01]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial
          map={backTexture}
          color="#1f2937"
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>

      {/* Card edge */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.05]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Card details (only visible when inspected) */}
      {isInspected && (
        <Html
          position={[0, -2, 0.1]}
          transform
          scale={0.15}
          rotation-x={-Math.PI}
        >
          <div className="bg-black/80 text-white p-4 rounded-md w-[400px] text-center">
            <h3
              className="text-xl font-bold capitalize mb-2 text-center"
              style={{ color: colors[card.rarity] }}
            >
              {card.rarity} Card #{card.id}
            </h3>
            <p>{cardDetails[card.rarity]}</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="px-2 py-1 bg-gray-800 rounded text-sm">
                ATK: {50 + card.id * 10}
              </div>
              <div className="px-2 py-1 bg-gray-800 rounded text-sm">
                DEF: {30 + card.id * 5}
              </div>
              <div className="px-2 py-1 bg-gray-800 rounded text-sm">
                SPD: {20 + card.id * 3}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
