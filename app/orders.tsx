import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/core/supabase/client.supabase';
import { useAuth } from '@/lib/modules/auth/AuthProvider';

type Order = {
  id: string;
  ingredients: {
    carne: number;
    queso: number;
    tomate: number;
    lechuga: number;
  };
  status: 'en_preparacion' | 'listo' | 'entregado';
  total_layers: number;
  created_at: string;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!session?.user.id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_preparacion':
        return { text: 'En Preparación', color: '#f59e0b', emoji: '👨‍🍳' };
      case 'listo':
        return { text: 'Listo', color: '#10b981', emoji: '✅' };
      case 'entregado':
        return { text: 'Entregado', color: '#6b7280', emoji: '📦' };
      default:
        return { text: 'Desconocido', color: '#9ca3af', emoji: '❓' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const buildIngredientText = (ingredients: Order['ingredients']) => {
    const parts = [];
    
    if (ingredients.carne > 0) {
      parts.push(`${ingredients.carne} carne${ingredients.carne > 1 ? 's' : ''}`);
    }
    if (ingredients.queso > 0) {
      parts.push(`${ingredients.queso} queso${ingredients.queso > 1 ? 's' : ''}`);
    }
    if (ingredients.lechuga > 0) {
      parts.push(`${ingredients.lechuga} lechuga${ingredients.lechuga > 1 ? 's' : ''}`);
    }
    if (ingredients.tomate > 0) {
      parts.push(`${ingredients.tomate} tomate${ingredients.tomate > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Mis Pedidos</Text>
          <Text style={styles.subtitle}>Historial de hamburguesas</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍔</Text>
              <Text style={styles.emptyText}>No tienes pedidos aún</Text>
              <Text style={styles.emptySubtext}>
                Arma tu primera hamburguesa y realiza un pedido
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/games/hamburguesa')}
              >
                <Text style={styles.createButtonText}>Crear Hamburguesa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => {
              const status = getStatusText(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderStatus}>
                      <Text style={styles.statusEmoji}>{status.emoji}</Text>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>

                  <View style={styles.orderBody}>
                    <Text style={styles.orderTitle}>🍔 Hamburguesa Personalizada</Text>
                    <Text style={styles.orderIngredients}>
                      {buildIngredientText(order.ingredients)}
                    </Text>
                    <Text style={styles.orderLayers}>
                      Total: {order.total_layers} capas (incluye panes)
                    </Text>
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderId}>Pedido #{order.id.slice(0, 8)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderBody: {
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  orderIngredients: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  orderLayers: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  orderId: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
});