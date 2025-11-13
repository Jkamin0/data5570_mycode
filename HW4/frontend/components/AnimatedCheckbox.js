import { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

export default function AnimatedCheckbox({ checked, onPress, color = COLORS.primary.main, size = 44 }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (checked) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      opacity.value = withSpring(1);
    } else {
      opacity.value = withSpring(0);
    }
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: checked ? color : 'transparent',
          },
        ]}
      >
        <Animated.Text style={[styles.checkmark, checkmarkStyle]}>✓</Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  checkmark: {
    color: COLORS.text.inverse,
    fontSize: 20,
    fontWeight: '700',
  },
});
