import { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text, Card, Button, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCategoryBalances,
  clearError,
} from '../store/slices/categoriesSlice';
import BudgetHealthChart from './BudgetHealthChart';
import { errorToMessage } from '../utils/error';
import type { CategoryBalance, ChartDataPoint } from '../types/models';
import { AppColors, getHealthColor } from '../theme/colors';

const transformCategoryBalances = (balances: CategoryBalance[]): ChartDataPoint[] => {
  return balances
    .map((balance) => {
      const allocated = parseFloat(balance.allocated);
      const spent = parseFloat(balance.spent);
      const available = parseFloat(balance.available);
      const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;

      const healthColor = getHealthColor(spentPercentage, available);

      return {
        categoryName: balance.category_name,
        allocated,
        spent,
        available,
        spentPercentage,
        healthColor,
      };
    })
    .filter((item) => item.allocated > 0)
    .sort((a, b) => b.spentPercentage - a.spentPercentage);
};

export default function BudgetHealthDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { balances, balancesLoading, error } = useAppSelector((state) => state.categories);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const isWeb = Platform.OS === 'web';

  const chartData = useMemo(() => transformCategoryBalances(balances), [balances]);

  useEffect(() => {
    dispatch(fetchCategoryBalances());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCategoryBalances());
    setRefreshing(false);
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  const handleRetry = () => {
    handleDismissSnackbar();
    dispatch(fetchCategoryBalances());
  };

  if (!isWeb) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.mobileNoticeTitle}>
            Budget Health Visualization
          </Text>
          <Text variant="bodyMedium" style={styles.mobileNoticeText}>
            Budget health charts are available on the web version. Use the Budget tab to view
            your category details.
          </Text>
          <Button
            mode="outlined"
            onPress={() => router.push('/(app)/budget')}
            style={styles.mobileNoticeButton}
            textColor={AppColors.oliveGreen}
          >
            View Budget
          </Button>
        </Card.Content>
      </Card>
    );
  }

  if (balancesLoading && balances.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading budget health...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No Budget Data Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              Create categories and allocate funds to see your budget health.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(app)/budget')}
              style={styles.emptyButton}
            >
              Go to Budget
            </Button>
          </Card.Content>
        </Card>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleDismissSnackbar}
          duration={4000}
          action={{
            label: 'Retry',
            onPress: handleRetry,
          }}
        >
          {errorToMessage(error)}
        </Snackbar>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Category Budget Health
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              Olive: healthy, Coral: warning (≥80%), Dark Olive: overspent
            </Text>
            <BudgetHealthChart data={chartData} />
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleDismissSnackbar}
        duration={4000}
        action={{
          label: 'Retry',
          onPress: handleRetry,
        }}
      >
        {errorToMessage(error)}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: AppColors.surface,
  },
  chartTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  chartSubtitle: {
    marginBottom: 16,
    color: AppColors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: AppColors.textSecondary,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
    color: AppColors.textPrimary,
  },
  emptyDescription: {
    marginBottom: 16,
    textAlign: 'center',
    color: AppColors.textSecondary,
  },
  emptyButton: {
    marginTop: 8,
  },
  mobileNoticeTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  mobileNoticeText: {
    marginBottom: 16,
    color: AppColors.textSecondary,
  },
  mobileNoticeButton: {
    marginTop: 8,
    borderColor: AppColors.oliveGreen,
  },
});
