import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../theme/colors";
import { useState } from "react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function HeroSection({
  onGetStarted,
  onLogin,
}: HeroSectionProps) {
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const heroHeight = isMobile
    ? windowHeight * 0.85
    : isTablet
    ? windowHeight * 0.75
    : windowHeight * 0.7;

  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  return (
    <View style={[styles.container, { minHeight: heroHeight }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="wallet-outline"
          size={isMobile ? 64 : 80}
          color={AppColors.limeGreen}
          style={styles.icon}
          accessibilityLabel="Budget wallet icon"
        />
        <Text
          variant="displayMedium"
          style={[styles.headline, isMobile && styles.headlineMobile]}
        >
          Budgeting for Free
        </Text>
        <Text variant="titleMedium" style={styles.valueProposition}>
          Stop living paycheck to paycheck.
        </Text>
        <Text variant="bodyLarge" style={styles.subheadline}>
          Zero-based budgeting that's actually simple. Track every dollar in
          real-time, adjust on the fly, and finally understand where your money
          goes.
        </Text>

        <View style={styles.trustIndicators}>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={AppColors.oliveGreen}
            />
            <Text style={styles.trustText}>Bank-level security</Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons
              name="clock-fast"
              size={20}
              color={AppColors.oliveGreen}
            />
            <Text style={styles.trustText}>Setup in 5 minutes</Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons
              name="credit-card-off"
              size={20}
              color={AppColors.oliveGreen}
            />
            <Text style={styles.trustText}>No credit card required</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onHoverIn={() => setPrimaryHovered(true)}
            onHoverOut={() => setPrimaryHovered(false)}
            style={({ pressed }) => [
              styles.primaryButtonWrapper,
              (primaryHovered || pressed) && styles.primaryButtonWrapperHovered,
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
              accessibilityHint="Opens the registration form"
            >
              Start Budgeting Free
            </Button>
          </Pressable>

          <Pressable
            onHoverIn={() => setSecondaryHovered(true)}
            onHoverOut={() => setSecondaryHovered(false)}
          >
            <Button
              mode="text"
              onPress={onLogin}
              textColor={
                secondaryHovered ? AppColors.limeGreen : AppColors.oliveGreen
              }
              labelStyle={styles.secondaryButtonLabel}
              accessibilityLabel="Log in to your account"
              accessibilityRole="button"
              accessibilityHint="Opens the login form"
            >
              Already have an account? Log In
            </Button>
          </Pressable>
        </View>

        <Text style={styles.subCTA}>Free forever. No trial limitations.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  icon: {
    marginBottom: 20,
  },
  headline: {
    marginBottom: 12,
    textAlign: "center",
    color: AppColors.textPrimary,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  headlineMobile: {
    fontSize: 36,
  },
  valueProposition: {
    marginBottom: 16,
    textAlign: "center",
    color: AppColors.limeGreen,
    fontWeight: "600",
  },
  subheadline: {
    marginBottom: 32,
    textAlign: "center",
    color: AppColors.textSecondary,
    paddingHorizontal: 16,
    lineHeight: 26,
  },
  trustIndicators: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButtonLabel: {
    fontSize: 15,
  },
  subCTA: {
    fontSize: 14,
    color: AppColors.textLight,
    textAlign: "center",
    fontStyle: "italic",
  },
});
