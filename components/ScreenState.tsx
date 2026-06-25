// File: ScreenState.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Component for error and loading handlers in all views

import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { styles } from '@/assets/styles/my_styles';

// props that can be defined on exported component
type ScreenStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: string | null;
  title?: string;
  onRetry?: () => void | Promise<void>;
  compact?: boolean;
};

// default export function
export function ScreenState({ loading, error, empty, title, onRetry, compact = false }: ScreenStateProps) {

  // if the prop passed is a loading state, show loading state view
  if (loading) {
    return (
      <View style={compact ? styles.stateInline : styles.stateContainer}>
        <ActivityIndicator color="#2D5A3D" />
        <Text style={styles.stateText}>{title ?? 'Loading'}</Text>
      </View>
    );
  }
  
  // if its an error, show error handling view
  if (error) {
    return (
      <View style={compact ? styles.stateInline : styles.stateContainer}>
        <View style={styles.stateIconCircle}>
          <Ionicons name="alert-circle-outline" size={22} color="#2D5A3D" />
        </View>
        <Text style={styles.stateTitle}>{title ?? 'Something went wrong'}</Text>
        <Text style={styles.stateText}>{error}</Text>
        {onRetry ? (
          <Pressable style={styles.stateRetryButton} onPress={onRetry}>
            <Text style={styles.stateRetryText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // if its empty then show a generic empty view, if its compact then smaller styling
  if (empty) {
    return (
      <View style={compact ? styles.stateInline : styles.stateContainer}>
        <View style={styles.stateIconCircle}>
          <Ionicons name="cafe-outline" size={22} color="#2D5A3D" />
        </View>
        <Text style={styles.stateText}>{empty}</Text>
      </View>
    );
  }

  return null;
}
