import { View, StyleSheet, Pressable } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '../../theme/colors';
import { useState } from 'react';

interface FinalCTAProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function FinalCTA({ onGetStarted, onLogin }: FinalCTAProps) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.headline}>
          Ready to Stop Stressing About Money?
        </Text>
        <Text variant="titleMedium" style={styles.subheadline}>
          Join the financial wellness movement. Start budgeting the smart way.
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={AppColors.limeGreen} />
            <Text style={styles.benefitText}>Free forever, no hidden fees</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={AppColors.limeGreen} />
            <Text style={styles.benefitText}>No credit card required</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={AppColors.limeGreen} />
            <Text style={styles.benefitText}>Start budgeting in under 5 minutes</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onHoverIn={() => setPrimaryHovered(true)}
            onHoverOut={() => setPrimaryHovered(false)}
            style={({ pressed }) => [
              styles.primaryButtonWrapper,
              (primaryHovered || pressed) && styles.primaryButtonWrapperHovered
            ]}
          >
            <Button
              mode="contained"
              onPress={onGetStarted}
              style={styles.primaryButton}
              labelStyle={styles.primaryButtonLabel}
              contentStyle={styles.primaryButtonContent}
              accessibilityLabel="Get started with a free account"
              accessibilityRole="button"
              icon={() => <MaterialCommunityIcons name="rocket-launch" size={20} color={AppColors.textOnPrimary} />}
            >
              Get Started Free
            </Button>
          </Pressable>

          <Pressable
            onHoverIn={() => setSecondaryHovered(true)}
            onHoverOut={() => setSecondaryHovered(false)}
          >
            <Button
              mode="text"
              onPress={onLogin}
              textColor={secondaryHovered ? AppColors.limeGreen : AppColors.oliveGreen}
              labelStyle={styles.secondaryButtonLabel}
              accessibilityLabel="Log in to your account"
              accessibilityRole="button"
            >
              Already budgeting? Log In
            </Button>
          </Pressable>
        </View>

        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="shield-lock" size={16} color={AppColors.textLight} />
          <Text style={styles.securityText}>
            Your data is encrypted and secure. We never sell your information.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  content: {
    maxWidth: 800,
    alignItems: 'center',
    width: '100%',
  },
  headline: {
    marginBottom: 16,
    textAlign: 'center',
    color: AppColors.textPrimary,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    paddingHorizontal: 16,
  },
  subheadline: {
    marginBottom: 40,
    textAlign: 'center',
    color: AppColors.textSecondary,
    paddingHorizontal: 16,
    lineHeight: 26,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    marginBottom: 40,
    paddingHorizontal: 16,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  primaryButtonWrapper: {
    borderRadius: 28,
    shadowColor: AppColors.limeGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonWrapperHovered: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  primaryButton: {
    borderRadius: 28,
    minWidth: 240,
  },
  primaryButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButtonLabel: {
    fontSize: 15,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    maxWidth: 500,
  },
  securityText: {
    fontSize: 13,
    color: AppColors.textLight,
    textAlign: 'center',
    flex: 1,
  },
});
