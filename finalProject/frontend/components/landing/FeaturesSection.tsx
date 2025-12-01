import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import FeatureCard from './FeatureCard';
import { AppColors } from '../../theme/colors';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'wallet-outline',
    title: 'Give Every Dollar a Job',
    description: 'Assign every dollar to a purpose before you spend it. No more wondering if you can afford something.',
  },
  {
    icon: 'lightning-bolt',
    title: 'Real-Time Balance Updates',
    description: 'Watch your budget adjust instantly as you spend. Always know exactly how much you have left.',
  },
  {
    icon: 'swap-horizontal',
    title: 'Flexible Money Movement',
    description: 'Plans change. Move money between categories in seconds when life throws you a curveball.',
  },
  {
    icon: 'timer-sand',
    title: 'Save Hours Every Month',
    description: 'What used to take hours now takes minutes. Intuitive design means less time budgeting, more time living.',
  },
];

export default function FeaturesSection() {
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const getCardWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '48%';
    return '23%';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineLarge" style={styles.title}>
          Everything You Need to Budget with Confidence
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Powerful features that make zero-based budgeting effortless
        </Text>
      </View>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {features.map((feature, index) => (
          <View key={index} style={[styles.cardWrapper, { width: getCardWidth() }]}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  headerContainer: {
    marginBottom: 48,
    paddingHorizontal: 16,
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: AppColors.textPrimary,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: AppColors.textSecondary,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  gridMobile: {
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 4,
  },
});
