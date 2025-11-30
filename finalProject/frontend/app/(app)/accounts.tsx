import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccounts, createAccount, clearError } from '../../store/slices/accountsSlice';
import { fetchCategoryBalances } from '../../store/slices/categoriesSlice';
import { errorToMessage } from '../../utils/error';
import CreateAccountDialog from '../../components/CreateAccountDialog';
import type { Account } from '../../types/models';

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
    // To-budget mirrors YNAB: cash - allocated + spent.
    return totalAccountBalance - totalAllocated + totalSpent;
  };

  const renderAccountItem = ({ item }: { item: Account }) => (
    <Card style={styles.accountCard}>
      <Card.Content>
        <View style={styles.accountHeader}>
          <Text variant="titleMedium" style={styles.accountName}>
            {item.name}
          </Text>
          <Text variant="titleLarge" style={styles.accountBalance}>
            ${parseFloat(item.balance).toFixed(2)}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.accountDate}>
          Updated {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Accounts Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Create your first account to start budgeting
      </Text>
    </View>
  );

  if (loading && accounts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  const availableToBudget = calculateAvailableToBudget();

  return (
    <View style={styles.container}>
      <Card style={styles.totalCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.totalLabel}>
            Total Available to Budget
          </Text>
          <Text variant="displaySmall" style={styles.totalAmount}>
            ${availableToBudget.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleOpenDialog}
        label="Add Account"
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
  totalCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#6200ee',
  },
  totalLabel: {
    color: '#fff',
    marginBottom: 8,
  },
  totalAmount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  accountCard: {
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    flex: 1,
  },
  accountBalance: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  accountDate: {
    color: '#666',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});
