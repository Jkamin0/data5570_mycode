import { View, ScrollView, StyleSheet } from 'react-native';
import { FAB, Card, Text } from 'react-native-paper';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import BudgetHealthDashboard from '../../components/BudgetHealthDashboard';
import { AppColors } from '../../theme/colors';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Budget Health Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Track your spending across categories
            </Text>
          </Card.Content>
        </Card>

        <BudgetHealthDashboard />
      </ScrollView>

      <FAB
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutFab}
        color="#fff"
        customSize={56}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    color: AppColors.textPrimary,
  },
  subtitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: AppColors.oliveGreen,
    fontWeight: '600',
  },
  logoutFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: AppColors.coral,
  },
});
