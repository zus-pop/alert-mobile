import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingProps {
  /** Show or hide the overlay */
  visible: boolean;
  /** Optional status text under the spinner */
  message?: string;
}

function Loading({ visible, message }: LoadingProps) {
  if (!visible) return null;

  return (
    <View style={styles.backdrop} pointerEvents="auto">
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.spinner} />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
