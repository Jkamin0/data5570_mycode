import { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import {
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
  ProgressBar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearError, registerUser } from "../../store/slices/authSlice";
import type { RegisterPayload } from "../../types/models";
import { errorToMessage } from "../../utils/error";
import { AppColors } from "../../theme/colors";

type ValidationErrors = Partial<Record<keyof RegisterPayload, string>>;

const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 0.25;
  if (password.length >= 12) strength += 0.15;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 0.25;
  if (/[0-9]/.test(password)) strength += 0.2;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 0.15;
  return Math.min(strength, 1);
};

const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 0.33) return AppColors.coral;
  if (strength < 0.67) return "#F2A744";
  return AppColors.oliveGreen;
};

const getPasswordStrengthText = (strength: number): string => {
  if (strength === 0) return "";
  if (strength < 0.33) return "Weak password";
  if (strength < 0.67) return "Good password";
  return "Strong password";
};

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const passwordStrength = calculatePasswordStrength(formData.password);

  const errorRecord =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : null;
  const detailMessage =
    typeof errorRecord?.["detail"] === "string"
      ? (errorRecord["detail"] as string)
      : null;
  const nonFieldRaw = errorRecord?.["non_field_errors"];
  const nonFieldMessage =
    Array.isArray(nonFieldRaw) &&
    nonFieldRaw.every((item) => typeof item === "string")
      ? (nonFieldRaw as string[]).join(", ")
      : typeof nonFieldRaw === "string"
      ? nonFieldRaw
      : null;
  const generalError = errorToMessage(error);

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    dispatch(clearError());

    const result = await dispatch(
      registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
      })
    );

    if (registerUser.rejected.match(result)) {
      const errors = result.payload;
      if (errors && typeof errors === "object") {
        setValidationErrors({
          username: Array.isArray(errors.username)
            ? errors.username[0]
            : errors.username,
          email: Array.isArray(errors.email) ? errors.email[0] : errors.email,
          password: Array.isArray(errors.password)
            ? errors.password[0]
            : errors.password,
          password_confirm: Array.isArray(errors.password_confirm)
            ? errors.password_confirm[0]
            : errors.password_confirm,
        });
      }
    }
  };

  const handleBackToLanding = () => {
    router.push("/(landing)");
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBackToLanding}
          style={styles.backButton}
          accessibilityLabel="Back to home"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={AppColors.textSecondary}
          />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface} elevation={4}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={48}
              color={AppColors.limeGreen}
              accessibilityLabel="Budget wallet icon"
            />
          </View>

          <Text variant="headlineLarge" style={styles.title}>
            Create Your Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Start your journey to financial wellness
          </Text>

          <View style={styles.benefitsBar}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={AppColors.limeGreen}
              />
              <Text style={styles.benefitText}>Free forever</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={AppColors.limeGreen}
              />
              <Text style={styles.benefitText}>No credit card</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={AppColors.limeGreen}
              />
              <Text style={styles.benefitText}>5 min setup</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              onBlur={() => markFieldAsTouched("username")}
              error={!!validationErrors.username}
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              style={styles.input}
              mode="outlined"
              outlineColor={AppColors.border}
              activeOutlineColor={AppColors.limeGreen}
              left={
                <TextInput.Icon
                  icon="account"
                  color={AppColors.textSecondary}
                />
              }
              accessibilityLabel="Username input field"
            />
            {validationErrors.username ? (
              <HelperText type="error" visible={true}>
                {validationErrors.username}
              </HelperText>
            ) : touchedFields.has("username") &&
              formData.username &&
              !validationErrors.username ? (
              <HelperText type="info" style={styles.successText} visible={true}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={14}
                  color={AppColors.oliveGreen}
                />{" "}
                Username is available
              </HelperText>
            ) : null}

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onBlur={() => markFieldAsTouched("email")}
              error={!!validationErrors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              style={styles.input}
              mode="outlined"
              outlineColor={AppColors.border}
              activeOutlineColor={AppColors.limeGreen}
              left={
                <TextInput.Icon icon="email" color={AppColors.textSecondary} />
              }
              accessibilityLabel="Email input field"
            />
            {validationErrors.email && (
              <HelperText type="error" visible={true}>
                {validationErrors.email}
              </HelperText>
            )}

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              onBlur={() => markFieldAsTouched("password")}
              secureTextEntry={!showPassword}
              error={!!validationErrors.password}
              autoComplete="password-new"
              textContentType="newPassword"
              style={styles.input}
              mode="outlined"
              outlineColor={AppColors.border}
              activeOutlineColor={AppColors.limeGreen}
              left={
                <TextInput.Icon icon="lock" color={AppColors.textSecondary} />
              }
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                />
              }
              accessibilityLabel="Password input field"
            />
            {formData.password && (
              <View style={styles.passwordStrengthContainer}>
                <ProgressBar
                  progress={passwordStrength}
                  color={getPasswordStrengthColor(passwordStrength)}
                  style={styles.passwordStrengthBar}
                />
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor(passwordStrength) },
                  ]}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
              </View>
            )}
            {validationErrors.password ? (
              <HelperText type="error" visible={true}>
                {validationErrors.password}
              </HelperText>
            ) : (
              <HelperText type="info" style={styles.helperText} visible={true}>
                At least 8 characters. Mix of letters, numbers, and symbols is
                stronger.
              </HelperText>
            )}

            <TextInput
              label="Confirm Password"
              value={formData.password_confirm}
              onChangeText={(text) =>
                setFormData({ ...formData, password_confirm: text })
              }
              onBlur={() => markFieldAsTouched("password_confirm")}
              secureTextEntry={!showConfirmPassword}
              error={!!validationErrors.password_confirm}
              autoComplete="password-new"
              textContentType="newPassword"
              style={styles.input}
              mode="outlined"
              outlineColor={AppColors.border}
              activeOutlineColor={AppColors.limeGreen}
              left={
                <TextInput.Icon
                  icon="lock-check"
                  color={AppColors.textSecondary}
                />
              }
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                />
              }
              accessibilityLabel="Confirm password input field"
            />
            {validationErrors.password_confirm && (
              <HelperText type="error" visible={true}>
                {validationErrors.password_confirm}
              </HelperText>
            )}

            {(generalError || detailMessage || nonFieldMessage) && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color={AppColors.coral}
                />
                <View style={styles.errorTextContainer}>
                  {generalError && (
                    <Text style={styles.errorText}>{generalError}</Text>
                  )}
                  {detailMessage && detailMessage !== generalError && (
                    <Text style={styles.errorText}>{detailMessage}</Text>
                  )}
                  {nonFieldMessage && nonFieldMessage !== generalError && (
                    <Text style={styles.errorText}>{nonFieldMessage}</Text>
                  )}
                </View>
              </View>
            )}

            <Pressable
              onHoverIn={() => setButtonHovered(true)}
              onHoverOut={() => setButtonHovered(false)}
              style={({ pressed }) => [
                styles.buttonWrapper,
                (buttonHovered || pressed) && styles.buttonWrapperHovered,
              ]}
            >
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Create account button"
                accessibilityRole="button"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </Pressable>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              onPress={() => router.push("/(auth)/login")}
              textColor={AppColors.oliveGreen}
              style={styles.secondaryButton}
              accessibilityLabel="Go to login"
              accessibilityRole="button"
            >
              Already have an account? Log In
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: AppColors.background,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 8,
  },
  backText: {
    color: AppColors.textSecondary,
    fontSize: 16,
  },
  surface: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: AppColors.surface,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    color: AppColors.textPrimary,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  benefitsBar: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: `${AppColors.limeGreen}10`,
    borderRadius: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  benefitText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  formContainer: {
    gap: 4,
  },
  input: {
    marginBottom: 4,
    backgroundColor: AppColors.inputBackground,
  },
  helperText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  successText: {
    color: AppColors.oliveGreen,
    fontSize: 12,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  passwordStrengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.divider,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: `${AppColors.coral}15`,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.coral,
  },
  errorTextContainer: {
    flex: 1,
    gap: 4,
  },
  errorText: {
    color: AppColors.coral,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonWrapper: {
    marginTop: 16,
    borderRadius: 28,
    shadowColor: AppColors.limeGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonWrapperHovered: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  button: {
    borderRadius: 28,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  termsContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: AppColors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.divider,
  },
  dividerText: {
    color: AppColors.textLight,
    fontSize: 14,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  securityText: {
    fontSize: 13,
    color: AppColors.textLight,
  },
});
