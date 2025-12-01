import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text, Card, FAB, Snackbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="tag-off-outline"
            size={64}
            color={AppColors.textLight}
          />
        </View>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Categories Yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptyDescription}>
          Create a category to start organizing your budget
        </Text>
      </View>
    );
  };

  const getCategoryBalance = (categoryId: number) => {
    return balances.find((b) => b.category_id === categoryId);
  };

  const renderHeader = () => {
    const availableToBudget = calculateAvailableToBudget();
    const isPositive = availableToBudget >= 0;

    return (
      <View style={styles.headerContainer}>
        <Card style={styles.summaryCard} elevation={4}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconCircle}>
                <MaterialCommunityIcons
                  name="cash-check"
                  size={32}
                  color="#fff"
                />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text variant="titleSmall" style={styles.summaryLabel}>
                  Available to Budget
                </Text>
                <Text
                  variant="displaySmall"
                  style={[
                    styles.summaryAmount,
                    { color: isPositive ? '#fff' : AppColors.coral },
                  ]}
                >
                  ${availableToBudget.toFixed(2)}
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              icon="swap-horizontal"
              onPress={() => setMoveMoneyDialogVisible(true)}
              style={styles.moveMoneyButton}
              labelStyle={styles.moveMoneyButtonLabel}
              disabled={categories.length < 2 || balances.length === 0}
              buttonColor={AppColors.limeGreen}
              textColor={AppColors.textOnPrimary}
            >
              Move Money
            </Button>
            {(categories.length < 2 || balances.length === 0) && (
              <Text variant="bodySmall" style={styles.moveMoneyHint}>
                Add at least two categories with balances to move money between them
              </Text>
            )}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Budget Categories
        </Text>
      </View>
    );
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
        ListHeaderComponent={categories.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={categories.length === 0 ? styles.emptyContainer : styles.listContent}
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
        label="Add Category"
        onPress={() => setCategoryDialogVisible(true)}
        style={styles.fab}
        color={AppColors.textOnPrimary}
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
        style={styles.snackbar}
      >
        {error ? errorToMessage(error) : ''}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  headerContainer: {
    marginBottom: 8,
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: AppColors.oliveGreen,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  summaryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  summaryAmount: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: -1,
  },
  moveMoneyButton: {
    borderRadius: 12,
  },
  moveMoneyButtonLabel: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  moveMoneyHint: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
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
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
