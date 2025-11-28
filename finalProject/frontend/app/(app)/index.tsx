import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Your Budget App
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Hello, {user?.username}!
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            Your authentication flow is complete. You can now build out the rest of your budgeting features.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#6200ee',
  },
  description: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  logoutButton: {
    marginTop: 24,
  },
});
