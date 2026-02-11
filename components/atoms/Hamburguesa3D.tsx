import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>🍔 Solo disponible en móvil</Text>
      </View>
    );
  }

  const loadModel = async (key: IngredienteKey): Promise<THREE.Object3D | null> => {
    try {
      const asset = Asset.fromModule(MODELOS[key]);
      await asset.downloadAsync();

      if (!asset.uri) {
        console.warn(`No se pudo obtener URI para ${key}`);
        return null;
      }

      console.log(`Cargando modelo: ${key} desde ${asset.uri}`);
      
      const model = await loadAsync(asset.uri);
      
      if (!model?.scene) {
        console.warn(`Modelo ${key} no tiene escena`);
        return null;
      }

      const cfg = INGREDIENT_CONFIG[key];
      model.scene.scale.set(cfg.scale, cfg.scale, cfg.scale);

      // Ocultar semillas/granos
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

      return model.scene;
    } catch (err) {
      console.error(`Error cargando modelo ${key}:`, err);
      return null;
    }
  };

  const onContextCreate = async (gl: any) => {
    try {
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
      setLoading(false);
    } catch (err) {
      console.error('Error inicializando escena 3D:', err);
      setError('Error al inicializar la escena 3D');
      setLoading(false);
    }
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    burgerRef.current.forEach(o => scene.remove(o));
    burgerRef.current = [];

    const build = async () => {
      try {
        setLoading(true);
        setError(null);

        let y = 0;

        const stack: { key: IngredienteKey }[] = [
          { key: 'panInf' },
          ...ingredientes.map(i => ({ key: i })),
          { key: 'panSup' },
        ];

        for (const item of stack) {
          const modelScene = await loadModel(item.key);
          
          if (!modelScene) {
            console.warn(`Saltando ingrediente ${item.key} (no se pudo cargar)`);
            continue;
          }

          const cfg = INGREDIENT_CONFIG[item.key];
          modelScene.position.set(0, y, 0);
          y += cfg.height;

          burgerRef.current.push(modelScene);
          scene.add(modelScene);
        }

        // Centrar la hamburguesa
        const centerY = y / 2;
        burgerRef.current.forEach(o => (o.position.y -= centerY));

        setLoading(false);
      } catch (err) {
        console.error('Error construyendo hamburguesa:', err);
        setError('Error al cargar algunos ingredientes');
        setLoading(false);
      }
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
      
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando modelo 3D...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Text style={styles.errorSubtext}>Algunos modelos no se pudieron cargar</Text>
        </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});