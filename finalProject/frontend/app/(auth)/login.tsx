import { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearError, loginUser } from "../../store/slices/authSlice";
import { errorToMessage } from "../../utils/error";
import { AppColors } from "../../theme/colors";

type LoginForm = {
  username: string;
  password: string;
};

type ValidationErrors = Partial<Record<keyof LoginForm, string>>;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const errorMessage = errorToMessage(error);

  const handleLogin = async () => {
    const errors: ValidationErrors = {};
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    dispatch(clearError());

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      // Navigation handled by root layout
    }
  };

  const handleBackToLanding = () => {
    router.push("/(landing)");
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
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Log in to continue managing your budget
          </Text>

          <View style={styles.formContainer}>
            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
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
            {validationErrors.username && (
              <HelperText type="error" visible={true}>
                {validationErrors.username}
              </HelperText>
            )}

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry={!showPassword}
              error={!!validationErrors.password}
              autoComplete="password"
              textContentType="password"
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
            {validationErrors.password && (
              <HelperText type="error" visible={true}>
                {validationErrors.password}
              </HelperText>
            )}

            {errorMessage && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color={AppColors.coral}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
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
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Log in button"
                accessibilityRole="button"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              onPress={() => router.push("/(auth)/register")}
              textColor={AppColors.oliveGreen}
              style={styles.secondaryButton}
              accessibilityLabel="Go to registration"
              accessibilityRole="button"
            >
              Don't have an account? Sign Up
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
    maxWidth: 480,
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
    marginBottom: 32,
    textAlign: "center",
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    gap: 4,
  },
  input: {
    marginBottom: 4,
    backgroundColor: AppColors.inputBackground,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: `${AppColors.coral}15`,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.coral,
  },
  errorText: {
    color: AppColors.coral,
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  buttonWrapper: {
    marginTop: 8,
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
