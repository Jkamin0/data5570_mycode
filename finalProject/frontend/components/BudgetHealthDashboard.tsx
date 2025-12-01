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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.mobileNoticeHeader}>
            <View style={styles.mobileNoticeIconContainer}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={32}
                color={AppColors.limeGreen}
              />
            </View>
            <View style={styles.mobileNoticeTextContainer}>
              <Text variant="titleMedium" style={styles.mobileNoticeTitle}>
                Budget Health Visualization
              </Text>
              <Text variant="bodyMedium" style={styles.mobileNoticeText}>
                Budget health charts are available on the web version
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            icon="calculator"
            onPress={() => router.push('/(app)/budget')}
            style={styles.mobileNoticeButton}
            buttonColor={AppColors.oliveGreen}
            textColor="#fff"
            labelStyle={styles.buttonLabel}
          >
            View Budget
          </Button>
        </Card.Content>
      </Card>
    );
  }

  if (balancesLoading && balances.length === 0) {
    return (
      <Card style={styles.card} elevation={3}>
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
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={64}
                color={AppColors.textLight}
              />
            </View>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No Budget Data Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              Create categories and allocate funds to see your budget health visualization
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push('/(app)/budget')}
              style={styles.emptyButton}
              buttonColor={AppColors.primary}
              textColor={AppColors.textOnPrimary}
              labelStyle={styles.buttonLabel}
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
          style={styles.snackbar}
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
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      >
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <View style={styles.chartIconContainer}>
                <MaterialCommunityIcons
                  name="poll"
                  size={28}
                  color={AppColors.limeGreen}
                />
              </View>
              <View style={styles.chartTextContainer}>
                <Text variant="titleMedium" style={styles.chartTitle}>
                  Category Budget Health
                </Text>
                <Text variant="bodySmall" style={styles.chartSubtitle}>
                  Visual breakdown of spending across categories
                </Text>
              </View>
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.healthy }]} />
                <Text variant="bodySmall" style={styles.legendText}>
                  Healthy
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.cautionary }]} />
                <Text variant="bodySmall" style={styles.legendText}>
                  Warning (80%+)
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: AppColors.overspent }]} />
                <Text variant="bodySmall" style={styles.legendText}>
                  Overspent
                </Text>
              </View>
            </View>

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
        style={styles.snackbar}
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
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTextContainer: {
    flex: 1,
  },
  chartTitle: {
    marginBottom: 4,
    fontWeight: '700',
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: AppColors.textSecondary,
    fontSize: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
    color: AppColors.textSecondary,
    fontWeight: '700',
  },
  emptyDescription: {
    marginBottom: 24,
    textAlign: 'center',
    color: AppColors.textLight,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 12,
  },
  mobileNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  mobileNoticeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileNoticeTextContainer: {
    flex: 1,
  },
  mobileNoticeTitle: {
    marginBottom: 4,
    fontWeight: '700',
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  },
  mobileNoticeText: {
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  mobileNoticeButton: {
    borderRadius: 12,
  },
  buttonLabel: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  snackbar: {
    backgroundColor: AppColors.surfaceElevated,
  },
});
