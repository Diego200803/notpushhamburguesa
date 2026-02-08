import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, loadAsync } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';

type Ingrediente = 'carne' | 'queso' | 'tomate' | 'lechuga';

type Hamburguesa3DProps = {
  ingredientes: Ingrediente[];
};

const MODELOS = {
  panInf: require('../../assets/models/hamburguesa/Pan_inferior.glb'),
  panSup: require('../../assets/models/hamburguesa/Pan_Superior.glb'),
  carne: require('../../assets/models/hamburguesa/Carne.glb'),
  queso: require('../../assets/models/hamburguesa/Queso.glb'),
  tomate: require('../../assets/models/hamburguesa/Tomate.glb'),
  lechuga: require('../../assets/models/hamburguesa/Lechuga.glb'),
} as const;

const INGREDIENT_CONFIG = {
  panInf: { scale: 0.22, height: 0.25 },
  panSup: { scale: 0.22, height: 0.25 },
  carne: { scale: 0.24, height: 0.12 },
  queso: { scale: 0.24, height: 0.08 },
  tomate: { scale: 0.24, height: 0.07 },
  lechuga: { scale: 0.24, height: 0.1 },
} as const;

type IngredienteKey = keyof typeof INGREDIENT_CONFIG;

export const Hamburguesa3D: React.FC<Hamburguesa3DProps> = ({ ingredientes }) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const burgerRef = useRef<THREE.Object3D[]>([]);
  const frameRef = useRef<number | null>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>🍔 Solo en móvil</Text>
      </View>
    );
  }

  const onContextCreate = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xffffff);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      100
    );

    camera.position.set(0, 1, 4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 8, 5);
    scene.add(light);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      burgerRef.current.forEach(o => (o.rotation.y += 0.002));
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    loop();
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    burgerRef.current.forEach(o => scene.remove(o));
    burgerRef.current = [];

    const build = async () => {
      let y = 0;

      const stack: { key: IngredienteKey }[] = [
        { key: 'panInf' },
        ...ingredientes.map(i => ({ key: i })),
        { key: 'panSup' },
      ];

      for (const item of stack) {
        const asset = Asset.fromModule(MODELOS[item.key]);
        await asset.downloadAsync();

        const model = await loadAsync(asset.uri);
        if (!model?.scene) continue;

        const cfg = INGREDIENT_CONFIG[item.key];
        model.scene.scale.set(cfg.scale, cfg.scale, cfg.scale);

        model.scene.traverse((child: any) => {
          if (child.isMesh) {
            const name = child.name.toLowerCase();
            if (
              name.includes('seed') ||
              name.includes('sesame') ||
              name.includes('grain')
            ) {
              child.visible = false;
            }
          }
        });

        model.scene.position.set(0, y, 0);
        y += cfg.height;

        burgerRef.current.push(model.scene);
        scene.add(model.scene);
      }

      const centerY = y / 2;
      burgerRef.current.forEach(o => (o.position.y -= centerY));
    };

    build();
  }, [ingredientes]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  glView: {
    flex: 1,
  },
});