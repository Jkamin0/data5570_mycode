import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    dispatch(clearError());

    const result = await dispatch(registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password_confirm,
    }));

    if (registerUser.rejected.match(result)) {
      const errors = result.payload;
      if (errors && typeof errors === 'object') {
        setValidationErrors({
          username: Array.isArray(errors.username) ? errors.username[0] : errors.username,
          email: Array.isArray(errors.email) ? errors.email[0] : errors.email,
          password: Array.isArray(errors.password) ? errors.password[0] : errors.password,
          password_confirm: Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : errors.password_confirm,
        });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

        <TextInput
          label="Username"
          value={formData.username}
          onChangeText={(text) => setFormData({ ...formData, username: text })}
          error={!!validationErrors.username}
          autoCapitalize="none"
          style={styles.input}
        />
        {validationErrors.username && (
          <HelperText type="error">{validationErrors.username}</HelperText>
        )}

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          error={!!validationErrors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        {validationErrors.email && (
          <HelperText type="error">{validationErrors.email}</HelperText>
        )}

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry={!showPassword}
          error={!!validationErrors.password}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />
        {validationErrors.password ? (
          <HelperText type="error">{validationErrors.password}</HelperText>
        ) : (
          <HelperText type="info">
            At least 8 characters, not too similar to your username, and not a common password
          </HelperText>
        )}

        <TextInput
          label="Confirm Password"
          value={formData.password_confirm}
          onChangeText={(text) => setFormData({ ...formData, password_confirm: text })}
          secureTextEntry={!showConfirmPassword}
          error={!!validationErrors.password_confirm}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          style={styles.input}
        />
        {validationErrors.password_confirm && (
          <HelperText type="error">{validationErrors.password_confirm}</HelperText>
        )}

        {error && typeof error === 'string' && (
          <Text style={styles.error}>{error}</Text>
        )}
        {error && typeof error === 'object' && error.detail && (
          <Text style={styles.error}>{error.detail}</Text>
        )}
        {error && typeof error === 'object' && error.non_field_errors && (
          <Text style={styles.error}>
            {Array.isArray(error.non_field_errors)
              ? error.non_field_errors.join(', ')
              : error.non_field_errors}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Register
        </Button>

        <Button onPress={() => router.back()}>
          Already have an account? Login
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 24,
    borderRadius: 8,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  error: {
    color: '#d32f2f',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
});
