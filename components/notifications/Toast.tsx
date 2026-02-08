import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/core/constants/theme';
import { borderRadius, spacing } from '@/lib/core/constants/layout';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const backgroundColor = {
    success: colors.success,
    error: colors.danger,
    info: colors.info,
  }[type];

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: colors.text.inverse,
    fontSize: fonts.sizes.base,
    fontWeight: '600',
    textAlign: 'center',
  },
});