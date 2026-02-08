import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, fonts } from '@/lib/core/constants/theme';
import { borderRadius, spacing } from '@/lib/core/constants/layout';

type InputProps = TextInputProps & {
  style?: ViewStyle;
};

export const Input: React.FC<InputProps> = ({ style, ...props }) => {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={colors.text.disabled}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fonts.sizes.base,
    backgroundColor: colors.surface,
    color: colors.text.primary,
  },
});