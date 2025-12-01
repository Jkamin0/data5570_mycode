import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { FAB, Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <Card style={styles.welcomeCard} elevation={3}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={32}
                  color={AppColors.limeGreen}
                />
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text variant="headlineSmall" style={styles.welcomeTitle}>
                  Budget Health
                </Text>
                <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
                  Track your spending across all categories
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <BudgetHealthDashboard />
      </ScrollView>

      <FAB
        icon="logout"
        label="Logout"
        onPress={handleLogout}
        style={styles.logoutFab}
        color={AppColors.textOnPrimary}
        customSize={56}
        variant="secondary"
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
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    marginBottom: 4,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  logoutFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: AppColors.coral,
    borderRadius: 28,
    shadowColor: AppColors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
