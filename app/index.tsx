import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/modules/auth/AuthProvider';

export default function Index() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🍔 Hamburguesa 3D</Text>
          <Text style={styles.subtitle}>Arma tu hamburguesa perfecta</Text>
          {session && (
            <Text style={styles.userInfo}>
              Bienvenido: {session.user.email}
            </Text>
          )}
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuButton, styles.burgerButton]}
            onPress={() => router.push('/games/hamburguesa')}
          >
            <Text style={styles.menuIcon}>🍔</Text>
            <Text style={styles.menuTitle}>Hamburguesa 3D</Text>
            <Text style={styles.menuDescription}>
              Visualiza y personaliza tu hamburguesa interactiva
            </Text>
          </TouchableOpacity>

          {/* BOTÓN DE PEDIDOS - NUEVO */}
          {session && (
            <TouchableOpacity
              style={[styles.menuButton, styles.ordersButton]}
              onPress={() => router.push('/orders')}
            >
              <Text style={styles.menuIcon}>📦</Text>
              <Text style={styles.menuTitle}>Mis Pedidos</Text>
              <Text style={styles.menuDescription}>
                Ver historial de hamburguesas pedidas
              </Text>
            </TouchableOpacity>
          )}

          {session && (
            <TouchableOpacity
              style={[styles.menuButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={styles.menuTitle}>Cerrar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desarrollado con React Native + Expo + Three.js + Supabase
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  userInfo: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 10,
  },
  menuContainer: {
    gap: 20,
  },
  menuButton: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  burgerButton: {
    backgroundColor: '#10b981',
  },
  ordersButton: {
    backgroundColor: '#f59e0b',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  menuIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  footer: {
    marginTop: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});