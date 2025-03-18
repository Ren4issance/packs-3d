"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Html,
  PerspectiveCamera,
  useTexture,
  useGLTF,
} from "@react-three/drei";
import { Button } from "../components/ui/button";
import { easing } from "maath";
import * as THREE from "three";

interface CardData {
  id: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  position: [number, number, number];
  rotation: [number, number, number];
}

interface PackProps {
  opened: boolean;
  setOpened: (animationStartTime: number) => void;
}

interface CardsProps {
  opened: boolean;
  inspectedCard: number | null;
  onInspect: (cardId: number) => void;
  packAnimationStartTime: number;
}

interface CardProps {
  card: CardData;
  opened: boolean;
  isInspected: boolean;
  onInspect: () => void;
  allCardsVisible: boolean;
  packAnimationStartTime: number;
}

export default function PackOpening() {
  const [opened, setOpened] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<number | null>(null);
  const [packAnimationStartTime, setPackAnimationStartTime] =
    useState<number>(0);

  const handleInspectCard = (cardId: number) => {
    setInspectedCard(cardId);
  };

  const closeInspection = () => {
    setInspectedCard(null);
  };

  const handlePackOpened = (startTime: number) => {
    setPackAnimationStartTime(startTime);
    setOpened(true);
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

        <Pack opened={opened} setOpened={handlePackOpened} />

        <Cards
          opened={opened}
          inspectedCard={inspectedCard}
          onInspect={handleInspectCard}
          packAnimationStartTime={packAnimationStartTime}
        />
      </Canvas>

      {inspectedCard && (
        <div
          className="absolute inset-0 pointer-events-auto z-10"
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
          <div className="absolute bottom-5 left-0 right-0 text-center text-white/80 text-sm">
            Click and drag to rotate card
          </div>
        </div>
      )}
    </div>
  );
}

function getRandomOffset(intensity: number): number {
  return (Math.random() - 0.5) * intensity * 2;
}

function Pack({ opened, setOpened }: PackProps) {
  const packGroupRef = useRef<THREE.Group>(null!);
  const { nodes, materials, scene } = useGLTF("/sample.glb");
  const { clock } = useThree();

  const [packRotation, setPackRotation] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [animationStartTime, setAnimationStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    if (packGroupRef.current) {
      // Clear existing content
      while (packGroupRef.current.children.length > 0) {
        packGroupRef.current.remove(packGroupRef.current.children[0]);
      }

      // Clone the original model
      const modelClone = scene.clone();
      modelClone.scale.set(4, 4, 4);
      modelClone.position.set(0, 0, 0);
      modelClone.rotation.set(0, 0, 0);

      modelClone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material = child.material.clone();
            child.material.roughness = 0.3;
            child.material.metalness = 0.7;
            child.material.emissive = new THREE.Color("#4f46e5");
            child.material.emissiveIntensity = 0.2;
          }
        }
      });

      packGroupRef.current.add(modelClone);
    }
  }, [scene]);

  const handlePointerDown = (e: any) => {
    if (!opened) {
      e.stopPropagation();
      setIsDragging(true);
      setClickStartTime(Date.now());
      setHasMoved(false);
      setPreviousMousePosition({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = "grabbing";
    }
  };

  const handlePointerUp = (e: any) => {
    if (!opened && isDragging) {
      const clickDuration = Date.now() - clickStartTime;
      if (clickDuration < 200 && !hasMoved) {
        const startTime = clock.getElapsedTime();
        setAnimationStartTime(startTime);
        setOpened(startTime);
      }
      setIsDragging(false);
      document.body.style.cursor = isHovered ? "grab" : "default";
    }
  };

  useEffect(() => {
    if (!opened) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            setHasMoved(true);
          }

          const rotationSpeed = 0.005;
          setPackRotation([
            THREE.MathUtils.clamp(
              packRotation[0] + deltaY * rotationSpeed,
              -0.5,
              0.5
            ),
            packRotation[1] + deltaX * rotationSpeed,
            packRotation[2],
          ]);

          setPreviousMousePosition({ x: e.clientX, y: e.clientY });
        }
      };

      const handleMouseUp = () => {
        if (isDragging) {
          const clickDuration = Date.now() - clickStartTime;
          if (clickDuration < 200 && !hasMoved) {
            const startTime = clock.getElapsedTime();
            setAnimationStartTime(startTime);
            setOpened(startTime);
          }
          setIsDragging(false);
          document.body.style.cursor = isHovered ? "grab" : "default";
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    opened,
    isDragging,
    previousMousePosition,
    isHovered,
    clickStartTime,
    hasMoved,
    packRotation,
    setOpened,
    clock,
  ]);

  useFrame((state, delta) => {
    if (!packGroupRef.current) return;

    if (opened) {
      const t = state.clock.getElapsedTime();
      const openingDuration = 1.5; // Shorter total animation
      const openingTime = Math.min(t - animationStartTime, openingDuration);
      const openingProgress = openingTime / openingDuration;

      // Directly start the fade out animation without shaking
      easing.damp3(
        packGroupRef.current.position,
        [0, -8 * openingProgress, 0],
        0.2,
        delta
      );
      easing.damp3(
        packGroupRef.current.scale,
        [1 - openingProgress, 1 - openingProgress, 1 - openingProgress],
        0.2,
        delta
      );
      easing.dampE(
        packGroupRef.current.rotation,
        [0, Math.PI * 2 * openingProgress, 0],
        0.2,
        delta
      );

      // Hide pack when animation is complete
      if (openingProgress >= 1) {
        packGroupRef.current.visible = false;
      }
    } else {
      if (isDragging) {
        packGroupRef.current.rotation.x = packRotation[0];
        packGroupRef.current.rotation.y = packRotation[1];
        packGroupRef.current.rotation.z = packRotation[2];
      } else {
        const t = state.clock.getElapsedTime();
        packGroupRef.current.rotation.y =
          Math.sin(t / 2) * 0.1 + packRotation[1];
        packGroupRef.current.position.y = Math.sin(t / 1.5) * 0.2;
      }
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      enabled={!opened && !isDragging}
    >
      <group
        ref={packGroupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          setIsHovered(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={(e) => {
          setIsHovered(false);
          document.body.style.cursor = "default";
        }}
      />
    </Float>
  );
}

useGLTF.preload("/sample.glb");

function Cards({
  opened,
  inspectedCard,
  onInspect,
  packAnimationStartTime,
}: CardsProps) {
  const cards: CardData[] = [
    {
      id: 1,
      rarity: "common",
      position: [-2.2, -0.2, 0],
      rotation: [0.1, -0.1, 0.05],
    },
    {
      id: 2,
      rarity: "rare",
      position: [-1.1, 0.1, 0.05],
      rotation: [0.05, -0.05, -0.05],
    },
    { id: 3, rarity: "epic", position: [0, 0.4, 0.1], rotation: [0, 0, 0.02] },
    {
      id: 4,
      rarity: "common",
      position: [1.1, 0.1, 0.05],
      rotation: [-0.05, 0.05, 0.05],
    },
    {
      id: 5,
      rarity: "legendary",
      position: [2.2, -0.2, 0],
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
          packAnimationStartTime={packAnimationStartTime}
        />
      ))}
    </group>
  );
}

function Card({
  card,
  opened,
  isInspected,
  onInspect,
  allCardsVisible,
  packAnimationStartTime,
}: CardProps) {
  const cardRef = useRef<THREE.Group>(null!);
  const frontTexture = useTexture("/placeholder.svg?height=512&width=512");
  const backTexture = useTexture("/placeholder.svg?height=512&width=512");
  const [rotation, setRotation] = useState<[number, number, number]>([
    Math.PI,
    0,
    0,
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const colors = {
    common: "#9ca3af",
    rare: "#3b82f6",
    epic: "#8b5cf6",
    legendary: "#f59e0b",
  };

  const initialPosition: [number, number, number] = [0, 0, -0.5];
  const initialRotation: [number, number, number] = [Math.PI, 0, 0];
  const initialScale: [number, number, number] = [0, 0, 0];

  const cardDetails = {
    common: "Common Card: Basic attributes and abilities.",
    rare: "Rare Card: Enhanced stats and special effects.",
    epic: "Epic Card: Powerful abilities and unique traits.",
    legendary: "Legendary Card: Game-changing powers and exceptional stats.",
  };

  const cardWidth = 2.1;
  const cardHeight = 2.7;
  const cardThickness = 0.02;
  const cornerRadius = 0.1;

  const createRoundedRectShape = () => {
    const shape = new THREE.Shape();
    const width = cardWidth;
    const height = cardHeight;
    const radius = cornerRadius;

    shape.moveTo(-width / 2 + radius, -height / 2);

    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(
      width / 2,
      -height / 2,
      width / 2,
      -height / 2 + radius
    );

    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(
      width / 2,
      height / 2,
      width / 2 - radius,
      height / 2
    );

    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(
      -width / 2,
      height / 2,
      -width / 2,
      height / 2 - radius
    );

    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(
      -width / 2,
      -height / 2,
      -width / 2 + radius,
      -height / 2
    );

    return shape;
  };

  useEffect(() => {
    if (isInspected) {
      const handleMouseDown = (e: MouseEvent) => {
        setIsDragging(true);
        setPreviousMousePosition({ x: e.clientX, y: e.clientY });
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          const rotationSpeed = 0.005;
          setRotation([
            THREE.MathUtils.clamp(
              rotation[0] + deltaY * rotationSpeed,
              Math.PI - 0.5,
              Math.PI + 0.5
            ),
            rotation[1] - deltaX * rotationSpeed,
            rotation[2],
          ]);

          setPreviousMousePosition({ x: e.clientX, y: e.clientY });

          document.body.style.cursor = "grabbing";
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = "grab";
      };

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
      easing.damp3(
        cardRef.current.position,
        initialPosition as [number, number, number],
        0.4,
        delta
      );
      easing.damp3(
        cardRef.current.scale,
        initialScale as [number, number, number],
        0.4,
        delta
      );
      easing.dampE(
        cardRef.current.rotation,
        initialRotation as [number, number, number],
        0.4,
        delta
      );
    } else if (isInspected) {
      easing.damp3(cardRef.current.position, [0, 0, 4], 0.2, delta);
      easing.damp3(cardRef.current.scale, [0.9, 1.22, 0.9], 0.2, delta);

      easing.dampE(cardRef.current.rotation, rotation, 0.2, delta);
    } else if (allCardsVisible) {
      const packOpeningDelay = 1.5; // Match the pack opening animation duration
      const t = state.clock.getElapsedTime();
      const timeElapsedSincePackOpened = t - packAnimationStartTime;

      if (timeElapsedSincePackOpened >= packOpeningDelay) {
        const individualCardDelay = card.id * 0.25;
        const cardRevealTime = Math.max(
          0,
          timeElapsedSincePackOpened - packOpeningDelay - individualCardDelay
        );

        if (cardRevealTime > 0) {
          const targetPos: [number, number, number] = [
            card.position[0] * 1.8,
            card.position[1] * 1.8 + 0.3,
            card.position[2] * 1.2 + 2.5,
          ];

          targetPos[2] += card.id * 0.05;

          easing.damp3(cardRef.current.position, targetPos, 0.2, delta);
          easing.damp3(cardRef.current.scale, [1, 1.35, 1], 0.4, delta);
          easing.dampE(
            cardRef.current.rotation,
            [card.rotation[0] + Math.PI, card.rotation[1], card.rotation[2]],
            0.4,
            delta
          );

          cardRef.current.position.y += Math.sin(cardRevealTime * 1.5) * 0.002;
          cardRef.current.position.z += Math.sin(cardRevealTime * 0.8) * 0.001;
          cardRef.current.rotation.z += Math.sin(cardRevealTime * 2) * 0.0005;
        } else {
          easing.damp3(
            cardRef.current.position,
            initialPosition as [number, number, number],
            0.4,
            delta
          );
          easing.damp3(
            cardRef.current.scale,
            initialScale as [number, number, number],
            0.4,
            delta
          );
        }
      } else {
        easing.damp3(
          cardRef.current.position,
          initialPosition as [number, number, number],
          0.4,
          delta
        );
        easing.damp3(
          cardRef.current.scale,
          initialScale as [number, number, number],
          0.4,
          delta
        );
      }
    } else {
      const targetPos: [number, number, number] = [
        card.position[0] * 3,
        card.position[1] * 3,
        -5,
      ];

      easing.damp3(cardRef.current.position, targetPos, 0.4, delta);
      easing.damp3(cardRef.current.scale, [0.5, 0.675, 0.5], 0.4, delta);
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
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[
            createRoundedRectShape(),
            {
              depth: cardThickness,
              bevelEnabled: true,
              bevelThickness: 0.002,
              bevelSize: 0.001,
              bevelSegments: 2,
            },
          ]}
        />
        <meshStandardMaterial
          map={frontTexture}
          color={colors[card.rarity]}
          roughness={0.3}
          metalness={0.7}
          emissive={colors[card.rarity]}
          emissiveIntensity={0.3}
        />
      </mesh>

      {isInspected && (
        <Html
          position={[0, -1.8, cardThickness / 2 + 0.05]}
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
