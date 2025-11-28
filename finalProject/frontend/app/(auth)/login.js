import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';

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

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Login</Text>

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
        {validationErrors.password && (
          <HelperText type="error">{validationErrors.password}</HelperText>
        )}

        {error && (
          <Text style={styles.error}>
            {typeof error === 'string' ? error : error.detail || 'Login failed'}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>

        <Button onPress={() => router.push('/(auth)/register')}>
          Don't have an account? Register
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
