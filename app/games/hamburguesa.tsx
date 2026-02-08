import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hamburguesa3D } from '@/components/atoms/Hamburguesa3D';

type Ingrediente = 'carne' | 'queso' | 'tomate' | 'lechuga';

const INGREDIENTES_INFO: Record<Ingrediente, { emoji: string; label: string; color: string }> = {
  carne: { emoji: 'Carne', label: 'Carne', color: '#8b4513' },
  queso: { emoji: 'Queso', label: 'Queso', color: '#ffd700' },
  tomate: { emoji: 'Tomate', label: 'Tomate', color: '#dc2626' },
  lechuga: { emoji: 'Lechuga', label: 'Lechuga', color: '#10b981' },
};

export default function HamburguesaScreen() {
  const router = useRouter();
  
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    'carne',
    'queso',
    'carne',
    'queso',
    'carne',
    'queso',
  ]);

  const agregarIngrediente = (ingrediente: Ingrediente) => {
    setIngredientes([...ingredientes, ingrediente]);
  };

  const quitarUltimo = () => {
    if (ingredientes.length > 0) {
      setIngredientes(ingredientes.slice(0, -1));
    }
  };

  const reiniciar = () => {
    setIngredientes(['carne', 'queso', 'carne', 'queso', 'carne', 'queso']);
  };

  const contarIngrediente = (tipo: Ingrediente) => {
    return ingredientes.filter((ing) => ing === tipo).length;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Arma tu Hamburguesa</Text>
            <Text style={styles.subtitle}>Triple carne con queso personalizable</Text>
          </View>

          <View style={styles.viewerContainer}>
            <Hamburguesa3D ingredientes={ingredientes} />
          </View>

          <View style={styles.counterContainer}>
            <Text style={styles.counterTitle}>Ingredientes actuales:</Text>
            <View style={styles.counterGrid}>
              {Object.entries(INGREDIENTES_INFO).map(([key, info]) => {
                const count = contarIngrediente(key as Ingrediente);
                return (
                  <View key={key} style={styles.counterItem}>
                    <Text style={styles.counterEmoji}>{info.emoji}</Text>
                    <Text style={styles.counterNumber}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Text style={styles.buttonsTitle}>Agregar ingrediente:</Text>
            <View style={styles.buttonsGrid}>
              {Object.entries(INGREDIENTES_INFO).map(([key, info]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.ingredientButton, { backgroundColor: info.color }]}
                  onPress={() => agregarIngrediente(key as Ingrediente)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ingredientEmoji}>{info.emoji}</Text>
                  <Text style={styles.ingredientLabel}>{info.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={quitarUltimo}
              disabled={ingredientes.length === 0}
            >
              <Text style={styles.actionButtonText}>Quitar último</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={reiniciar}
            >
              <Text style={styles.actionButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Toca un ingrediente para agregarlo a tu hamburguesa
            </Text>
            <Text style={styles.infoText}>
              Total de capas: {ingredientes.length + 2} (incluye panes)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  counterContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  counterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterItem: {
    alignItems: 'center',
  },
  counterEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  counterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  ingredientButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  ingredientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  resetButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    maxWidth: 400,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 4,
  },
});
