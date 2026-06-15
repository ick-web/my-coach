import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Colors, Radius, Typography } from '@/constants/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, onFocus, onBlur, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? '#DC2626' : focused ? Colors.primary : Colors.border;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={Colors.subtext}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.text,
  },
  input: {
    height: 54,
    borderRadius: Radius.input,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: '#fff',
  },
  error: {
    ...Typography.subtext,
    color: '#DC2626',
    marginTop: 4,
  },
});
