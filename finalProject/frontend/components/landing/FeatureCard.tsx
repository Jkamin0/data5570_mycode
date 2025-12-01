import { View, StyleSheet, Pressable } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '../../theme/colors';
import { useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={styles.pressable}
    >
      <Surface
        style={[
          styles.card,
          isHovered && styles.cardHovered,
        ]}
        elevation={isHovered ? 4 : 2}
      >
        <View style={[styles.iconContainer, isHovered && styles.iconContainerHovered]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={48}
            color={isHovered ? AppColors.limeGreen : AppColors.oliveGreen}
            accessibilityLabel={`${title} icon`}
          />
        </View>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: '100%',
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    height: 260,
    borderWidth: 1,
    borderColor: AppColors.divider,
    justifyContent: 'flex-start',
  },
  cardHovered: {
    borderColor: AppColors.oliveGreen,
    backgroundColor: AppColors.surfaceVariant,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: AppColors.surfaceVariant,
  },
  iconContainerHovered: {
    backgroundColor: AppColors.darkOlive,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    color: AppColors.textPrimary,
    fontWeight: '600',
    lineHeight: 22,
  },
  description: {
    textAlign: 'center',
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
});
