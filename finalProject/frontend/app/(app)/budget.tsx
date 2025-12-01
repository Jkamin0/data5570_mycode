import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, FAB, Snackbar, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCategories,
  fetchCategoryBalances,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError as clearCategoryError,
} from '../../store/slices/categoriesSlice';
import {
  fetchAccounts,
  clearError as clearAccountError,
} from '../../store/slices/accountsSlice';
import {
  fetchAllocations,
  createAllocation,
  moveMoney,
  clearError as clearAllocationError,
} from '../../store/slices/allocationsSlice';
import CreateCategoryDialog from '../../components/CreateCategoryDialog';
import AllocateFundsDialog from '../../components/AllocateFundsDialog';
import MoveMoneyDialog from '../../components/MoveMoneyDialog';
import CategoryListItem from '../../components/CategoryListItem';
import { errorToMessage } from '../../utils/error';
import type { Category, MoveMoneyPayload } from '../../types/models';
import { AppColors } from '../../theme/colors';

export default function BudgetScreen() {
  const dispatch = useAppDispatch();
  const { items: categories, balances, loading, balancesLoading, error: categoryError } =
    useAppSelector((state) => state.categories);
  const { items: accounts, error: accountError } = useAppSelector((state) => state.accounts);
  const { items: allocations, error: allocationError } = useAppSelector(
    (state) => state.allocations,
  );

  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [allocateFundsDialogVisible, setAllocateFundsDialogVisible] = useState(false);
  const [moveMoneyDialogVisible, setMoveMoneyDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategoryForAllocation, setSelectedCategoryForAllocation] = useState<number | undefined>(undefined);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const error = categoryError || accountError || allocationError;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchCategories()),
      dispatch(fetchCategoryBalances()),
      dispatch(fetchAccounts()),
      dispatch(fetchAllocations()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateAvailableToBudget = (): number => {
    const totalAccountBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance || '0'),
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

  const handleCreateCategory = async (name: string) => {
    const result = await dispatch(createCategory({ name }));

    if (createCategory.fulfilled.match(result)) {
      setCategoryDialogVisible(false);
      await dispatch(fetchCategoryBalances());
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategoryForAllocation(category.id);
    setAllocateFundsDialogVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryDialogVisible(true);
  };

  const handleUpdateCategory = async (name: string) => {
    if (!editingCategory) return;

    const result = await dispatch(
      updateCategory({ id: editingCategory.id, data: { name } }),
    );

    if (updateCategory.fulfilled.match(result)) {
      setCategoryDialogVisible(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const result = await dispatch(deleteCategory(category.id));

    if (deleteCategory.fulfilled.match(result)) {
      await dispatch(fetchCategoryBalances());
    }
  };

  const handleAllocateFunds = async (
    categoryId: number,
    accountId: number,
    amount: number,
  ) => {
    const result = await dispatch(
      createAllocation({ category: categoryId, account: accountId, amount }),
    );

    if (createAllocation.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchAccounts()),
        dispatch(fetchCategoryBalances()),
        dispatch(fetchAllocations()),
      ]);
      setAllocateFundsDialogVisible(false);
    }
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearCategoryError());
    dispatch(clearAccountError());
    dispatch(clearAllocationError());
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogVisible(false);
    setEditingCategory(null);
  };

  const handleCloseAllocateFundsDialog = () => {
    setAllocateFundsDialogVisible(false);
    setSelectedCategoryForAllocation(undefined);
  };

  const handleMoveMoney = async (payload: MoveMoneyPayload) => {
    const result = await dispatch(moveMoney(payload));

    if (moveMoney.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchCategoryBalances()),
        dispatch(fetchAllocations()),
      ]);
      setMoveMoneyDialogVisible(false);
    }
  };

  const renderEmptyState = () => {
    if (loading && categories.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.emptyText}>Loading categories...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No categories yet</Text>
        <Text style={styles.emptySubtext}>
          Create a category to start budgeting
        </Text>
      </View>
    );
  };

  const getCategoryBalance = (categoryId: number) => {
    return balances.find((b) => b.category_id === categoryId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CategoryListItem
            category={item}
            balance={getCategoryBalance(item.id)}
            onPress={handleCategoryPress}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        )}
        ListHeaderComponent={
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.summaryLabel}>
                Available to Budget
              </Text>
              <Text variant="headlineLarge" style={styles.summaryAmount}>
                ${calculateAvailableToBudget().toFixed(2)}
              </Text>
              <Button
                mode="outlined"
                icon="swap-horizontal"
                onPress={() => setMoveMoneyDialogVisible(true)}
                style={styles.moveMoneyButton}
                textColor="#fff"
                disabled={categories.length < 2 || balances.length === 0}
              >
                Move Money
              </Button>
              {(categories.length < 2 || balances.length === 0) && (
                <Text variant="bodySmall" style={styles.moveMoneyHint}>
                  Add at least two categories with balances to move money.
                </Text>
              )}
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={categories.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FAB
        icon="plus"
        label="Add Category"
        onPress={() => setCategoryDialogVisible(true)}
        style={styles.fab}
      />

      <CreateCategoryDialog
        visible={categoryDialogVisible}
        onDismiss={handleCloseCategoryDialog}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        initialData={editingCategory || undefined}
        mode={editingCategory ? 'edit' : 'create'}
      />

      <AllocateFundsDialog
        visible={allocateFundsDialogVisible}
        onDismiss={handleCloseAllocateFundsDialog}
        onSubmit={handleAllocateFunds}
        categories={categories}
        accounts={accounts}
        preselectedCategoryId={selectedCategoryForAllocation}
        availableToBudget={calculateAvailableToBudget()}
      />

      <MoveMoneyDialog
        visible={moveMoneyDialogVisible}
        onDismiss={() => setMoveMoneyDialogVisible(false)}
        onSubmit={handleMoveMoney}
        categories={categories}
        accounts={accounts}
        balances={balances}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleDismissSnackbar}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: handleDismissSnackbar,
        }}
      >
        {error ? errorToMessage(error) : ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: AppColors.background,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: AppColors.oliveGreen,
    elevation: 4,
  },
  summaryLabel: {
    color: '#fff',
    marginBottom: 4,
  },
  summaryAmount: {
    color: '#fff',
    fontWeight: '700',
  },
  moveMoneyButton: {
    marginTop: 12,
    borderColor: '#fff',
  },
  moveMoneyHint: {
    marginTop: 6,
    color: '#e0e0e0',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: AppColors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.textLight,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
