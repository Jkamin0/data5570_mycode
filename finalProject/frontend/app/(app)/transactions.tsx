import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { Text, FAB, ActivityIndicator, Snackbar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  clearError,
} from '../../store/slices/transactionsSlice';
import { fetchAccounts } from '../../store/slices/accountsSlice';
import { fetchCategories, fetchCategoryBalances } from '../../store/slices/categoriesSlice';
import { errorToMessage } from '../../utils/error';
import TransactionListItem from '../../components/TransactionListItem';
import CreateTransactionDialog from '../../components/CreateTransactionDialog';
import type { Transaction, CreateTransactionPayload } from '../../types/models';
import { AppColors } from '../../theme/colors';

export default function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const { items: transactions, loading, error } = useAppSelector((state) => state.transactions);
  const { items: accounts } = useAppSelector((state) => state.accounts);
  const { items: categories, balances } = useAppSelector((state) => state.categories);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const errorMessage = errorToMessage(error);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchTransactions()),
      dispatch(fetchAccounts()),
      dispatch(fetchCategories()),
      dispatch(fetchCategoryBalances()),
    ]);
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

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

  const handleCreateTransaction = async (payload: CreateTransactionPayload) => {
    const result = await dispatch(createTransaction(payload));
    if (createTransaction.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchTransactions()),
        dispatch(fetchAccounts()),
        dispatch(fetchCategoryBalances()),
      ]);
      setDialogVisible(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    const result = await dispatch(deleteTransaction(id));
    if (deleteTransaction.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchTransactions()),
        dispatch(fetchAccounts()),
        dispatch(fetchCategoryBalances()),
      ]);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionListItem transaction={item} onDelete={handleDeleteTransaction} />
  );

  const calculateTotals = () => {
    return transactions.reduce(
      (acc, txn) => {
        const amount = parseFloat(txn.amount);
        if (txn.transaction_type === 'income') {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  };

  const renderHeader = () => {
    const { income, expense } = calculateTotals();
    const net = income - expense;
    const isNetPositive = net >= 0;

    return (
      <View style={styles.headerContainer}>
        <Card style={styles.summaryCard} elevation={4}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="chart-box"
                  size={32}
                  color={AppColors.limeGreen}
                />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text variant="titleMedium" style={styles.summaryTitle}>
                  Transaction Summary
                </Text>
                <Text variant="bodySmall" style={styles.summarySubtitle}>
                  Overall financial flow
                </Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryItemHeader}>
                  <MaterialCommunityIcons
                    name="arrow-down-circle"
                    size={20}
                    color={AppColors.positive}
                  />
                  <Text variant="labelMedium" style={styles.summaryItemLabel}>
                    Income
                  </Text>
                </View>
                <Text variant="headlineSmall" style={styles.incomeText}>
                  +${income.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <View style={styles.summaryItemHeader}>
                  <MaterialCommunityIcons
                    name="arrow-up-circle"
                    size={20}
                    color={AppColors.negative}
                  />
                  <Text variant="labelMedium" style={styles.summaryItemLabel}>
                    Expenses
                  </Text>
                </View>
                <Text variant="headlineSmall" style={styles.expenseText}>
                  -${expense.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.summaryItem, styles.netItem]}>
                <View style={styles.summaryItemHeader}>
                  <MaterialCommunityIcons
                    name="equal"
                    size={20}
                    color={isNetPositive ? AppColors.positive : AppColors.negative}
                  />
                  <Text variant="labelMedium" style={styles.summaryItemLabel}>
                    Net Flow
                  </Text>
                </View>
                <Text
                  variant="headlineMedium"
                  style={[
                    styles.netText,
                    { color: isNetPositive ? AppColors.positive : AppColors.negative },
                  ]}
                >
                  {isNetPositive ? '+' : ''}${net.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Transactions
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={64}
          color={AppColors.textLight}
        />
      </View>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Transactions Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Tap the + button to add your first transaction and start tracking your finances
      </Text>
      {accounts.length === 0 && (
        <View style={styles.emptyHintContainer}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={AppColors.textLight}
          />
          <Text variant="bodySmall" style={styles.emptyHint}>
            Create an account first to log spending or income
          </Text>
        </View>
      )}
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={transactions.length > 0 ? renderHeader : null}
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
        label="Add Transaction"
        disabled={accounts.length === 0}
        color={AppColors.textOnPrimary}
      />

      <CreateTransactionDialog
        visible={dialogVisible}
        onDismiss={handleCloseDialog}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
        categories={categories}
        balances={balances}
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
  summaryCard: {
    marginBottom: 20,
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  summaryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    marginBottom: 4,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  summarySubtitle: {
    color: AppColors.textSecondary,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryItemLabel: {
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  incomeText: {
    color: AppColors.positive,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  expenseText: {
    color: AppColors.negative,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  netItem: {
    backgroundColor: AppColors.surfaceVariant,
  },
  netText: {
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
    marginBottom: 16,
  },
  emptyHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyHint: {
    color: AppColors.textLight,
    flex: 1,
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
