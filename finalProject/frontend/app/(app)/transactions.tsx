import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Snackbar } from 'react-native-paper';
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

    return (
      <View style={styles.summaryCard}>
        <Text variant="titleSmall" style={styles.summaryLabel}>
          Transaction Summary
        </Text>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Income</Text>
          <Text variant="titleMedium" style={styles.incomeText}>
            ${income.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Expenses</Text>
          <Text variant="titleMedium" style={styles.expenseText}>
            -${expense.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="bodyMedium">Net</Text>
          <Text
            variant="titleMedium"
            style={[styles.netText, { color: net >= 0 ? '#4CAF50' : '#F44336' }]}
          >
            ${net.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Transactions Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Tap + to add your first transaction
      </Text>
      {accounts.length === 0 && (
        <Text variant="bodySmall" style={styles.emptyHint}>
          Add an account first to log spending or income.
        </Text>
      )}
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleOpenDialog}
        label="Add Transaction"
        disabled={accounts.length === 0}
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
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  summaryLabel: {
    color: '#666',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incomeText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  expenseText: {
    color: '#F44336',
    fontWeight: '700',
  },
  netText: {
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 12,
    color: '#666',
  },
  emptyDescription: {
    color: '#999',
  },
  emptyHint: {
    color: '#777',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
