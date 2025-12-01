import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import WorkflowStep from './WorkflowStep';
import { AppColors } from '../../theme/colors';

interface WorkflowStepData {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
}

const steps: WorkflowStepData[] = [
  {
    stepNumber: 1,
    icon: 'account-plus',
    title: 'Sign Up Free',
    description: 'Create your account in under 2 minutes. No credit card, no trial period, just get started.',
  },
  {
    stepNumber: 2,
    icon: 'wallet-plus',
    title: 'Add Your Income',
    description: 'Enter your available money. Connect accounts or add manually—whatever works for you.',
  },
  {
    stepNumber: 3,
    icon: 'format-list-checks',
    title: 'Assign Every Dollar',
    description: 'Create categories and allocate all your money. Give every dollar a specific job to do.',
  },
  {
    stepNumber: 4,
    icon: 'chart-timeline-variant',
    title: 'Track & Adjust',
    description: 'Log transactions and move money as needed. Your budget evolves with your life.',
  },
];

export default function HowItWorksSection() {
  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineLarge" style={styles.title}>
          Get Started in Minutes
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          No complicated setup. No financial jargon. Just four simple steps to take control.
        </Text>
      </View>
      <View style={[styles.stepsContainer, isMobile && styles.stepsContainerMobile]}>
        {steps.map((step, index) => (
          <WorkflowStep
            key={index}
            stepNumber={step.stepNumber}
            icon={step.icon}
            title={step.title}
            description={step.description}
            isLast={index === steps.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background,
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  headerContainer: {
    marginBottom: 56,
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
  stepsContainer: {
    paddingHorizontal: 16,
    maxWidth: 900,
    alignSelf: 'center',
  },
  stepsContainerMobile: {
    paddingHorizontal: 8,
  },
});
