import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccounts, createAccount, clearError } from '../../store/slices/accountsSlice';
import { fetchCategoryBalances } from '../../store/slices/categoriesSlice';
import { errorToMessage } from '../../utils/error';
import CreateAccountDialog from '../../components/CreateAccountDialog';
import type { Account } from '../../types/models';
import { AppColors } from '../../theme/colors';

export default function AccountsScreen() {
  const dispatch = useAppDispatch();
  const { items: accounts, loading, error } = useAppSelector((state) => state.accounts);
  const { balances } = useAppSelector((state) => state.categories);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const errorMessage = errorToMessage(error);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchAccounts()),
      dispatch(fetchCategoryBalances()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenDialog = () => {
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  const handleCreateAccount = async (name: string, balance: number) => {
    const result = await dispatch(createAccount({ name, balance }));
    if (createAccount.fulfilled.match(result)) {
      setSnackbarVisible(false);
    }
  };

  const calculateAvailableToBudget = (): number => {
    const totalAccountBalance = accounts.reduce(
      (total, account) => total + parseFloat(account.balance || '0'),
      0,
    );
    const totalAllocated = balances.reduce(
      (sum, bal) => sum + parseFloat(bal.allocated || '0'),
      0,
    );
    const totalSpent = balances.reduce(
      (sum, bal) => sum + parseFloat(bal.spent || '0'),
      0,
    );
    return totalAccountBalance - totalAllocated + totalSpent;
  };

  const getTotalBalance = (): number => {
    return accounts.reduce(
      (total, account) => total + parseFloat(account.balance || '0'),
      0,
    );
  };

  const renderAccountItem = ({ item }: { item: Account }) => {
    const balance = parseFloat(item.balance);
    const isPositive = balance >= 0;

    return (
      <Card style={styles.accountCard} elevation={2}>
        <Card.Content>
          <View style={styles.accountHeader}>
            <View style={styles.accountIconContainer}>
              <MaterialCommunityIcons
                name="bank"
                size={28}
                color={AppColors.limeGreen}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text variant="titleMedium" style={styles.accountName}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.accountDate}>
                Updated {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.accountBalanceContainer}>
              <Text
                variant="headlineSmall"
                style={[
                  styles.accountBalance,
                  { color: isPositive ? AppColors.positive : AppColors.negative },
                ]}
              >
                ${balance.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="bank-off-outline"
          size={64}
          color={AppColors.textLight}
        />
      </View>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Accounts Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Create your first account to start budgeting and tracking your finances
      </Text>
    </View>
  );

  const renderHeader = () => {
    const availableToBudget = calculateAvailableToBudget();
    const totalBalance = getTotalBalance();
    const isAvailablePositive = availableToBudget >= 0;

    return (
      <View style={styles.headerContainer}>
        <Card style={styles.totalCard} elevation={4}>
          <Card.Content>
            <View style={styles.totalCardContent}>
              <View style={styles.totalSection}>
                <View style={styles.totalIconCircle}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={32}
                    color="#fff"
                  />
                </View>
                <View style={styles.totalTextContainer}>
                  <Text variant="titleSmall" style={styles.totalLabel}>
                    Total Balance
                  </Text>
                  <Text variant="displaySmall" style={styles.totalAmount}>
                    ${totalBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.availableSection}>
                <Text variant="labelMedium" style={styles.availableLabel}>
                  Available to Budget
                </Text>
                <Text
                  variant="headlineMedium"
                  style={[
                    styles.availableAmount,
                    { color: isAvailablePositive ? '#fff' : AppColors.coral },
                  ]}
                >
                  ${availableToBudget.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your Accounts
        </Text>
      </View>
    );
  };

  if (loading && accounts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={accounts.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleOpenDialog}
        label="Add Account"
        color={AppColors.textOnPrimary}
      />

      <CreateAccountDialog
        visible={dialogVisible}
        onDismiss={handleCloseDialog}
        onSubmit={handleCreateAccount}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          dispatch(clearError());
        }}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setSnackbarVisible(false);
            dispatch(clearError());
          },
        }}
        style={styles.snackbar}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 16,
    color: AppColors.textSecondary,
    fontSize: 16,
  },
  headerContainer: {
    marginBottom: 8,
  },
  totalCard: {
    marginBottom: 20,
    backgroundColor: AppColors.oliveGreen,
    borderRadius: 16,
  },
  totalCardContent: {
    flexDirection: 'column',
    gap: 16,
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalTextContainer: {
    flex: 1,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: -1,
  },
  dividerVertical: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  availableSection: {
    alignItems: 'flex-start',
  },
  availableLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  availableAmount: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    marginBottom: 12,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
  },
  accountCard: {
    marginBottom: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    marginBottom: 4,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  accountDate: {
    color: AppColors.textSecondary,
  },
  accountBalanceContainer: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
    color: AppColors.textSecondary,
    fontWeight: '700',
  },
  emptyDescription: {
    color: AppColors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.primary,
    borderRadius: 28,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  snackbar: {
    backgroundColor: AppColors.surfaceElevated,
  },
});
