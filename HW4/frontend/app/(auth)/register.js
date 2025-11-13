import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../store/authSlice';
import StyledInput from '../../components/StyledInput';
import GradientButton from '../../components/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (!passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';
    if (password && passwordConfirm && password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(
        register({
          username,
          email,
          password,
          password_confirm: passwordConfirm,
        })
      ).unwrap();
      router.replace('/(tabs)');
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        const formattedErrors = {};
        for (const [key, value] of Object.entries(err)) {
          const errorText = Array.isArray(value) ? value.join(', ') : value;
          formattedErrors[key] = errorText;
        }
        setErrors(formattedErrors);
      } else {
        setErrors({ general: err?.error || 'Registration failed' });
      }
    }
  };

  return (
    <LinearGradient
      colors={COLORS.secondary.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={64} color={COLORS.text.inverse} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your habit journey today</Text>
          </View>

          <View style={styles.form}>
            <StyledInput
              placeholder="Username *"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((prev) => ({ ...prev, username: null }));
              }}
              autoCapitalize="none"
              icon="person-outline"
              error={errors.username}
            />

            <StyledInput
              placeholder="Email (optional)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: null }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
            />

            <StyledInput
              placeholder="Password *"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: null }));
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <StyledInput
              placeholder="Confirm Password *"
              value={passwordConfirm}
              onChangeText={(text) => {
                setPasswordConfirm(text);
                setErrors((prev) => ({ ...prev, passwordConfirm: null }));
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.passwordConfirm || errors.password_confirm}
            />

            {errors.general && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error.main} />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            <GradientButton
              title="Sign Up"
              onPress={handleRegister}
              loading={loading}
              gradient={COLORS.secondary.gradient}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.massive,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  form: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
  },
  button: {
    marginTop: SPACING.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error.light + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error.main,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  link: {
    color: COLORS.secondary.main,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
