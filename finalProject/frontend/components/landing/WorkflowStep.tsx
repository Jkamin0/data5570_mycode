import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '../../theme/colors';

interface WorkflowStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function WorkflowStep({ stepNumber, icon, title, description, isLast }: WorkflowStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{stepNumber}</Text>
        </View>
        {!isLast && <View style={styles.connectingLine} />}
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={icon as any}
            size={36}
            color={AppColors.limeGreen}
            accessibilityLabel={`${title} icon`}
          />
        </View>
        <View style={styles.contentContainer}>
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 20,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.limeGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.textOnPrimary,
  },
  connectingLine: {
    width: 3,
    flex: 1,
    backgroundColor: AppColors.divider,
    marginTop: 12,
    marginBottom: 8,
  },
  rightColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: AppColors.surfaceVariant,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    marginBottom: 8,
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  description: {
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
});
