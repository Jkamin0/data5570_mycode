import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Dialog, Portal, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category, CategoryBalance } from '../types/models';
import { AppColors, getAvailableColor } from '../theme/colors';

interface CategoryListItemProps {
  category: Category;
  balance: CategoryBalance | undefined;
  onPress?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export default function CategoryListItem({
  category,
  balance,
  onPress,
  onEdit,
  onDelete,
}: CategoryListItemProps) {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const getAvailableColorForDisplay = (available: string | undefined): string => {
    if (!available) return AppColors.textLight;
    const availableNum = parseFloat(available);
    return getAvailableColor(availableNum);
  };

  const getProgressPercentage = (): number => {
    if (!balance) return 0;
    const allocated = parseFloat(balance.allocated);
    const spent = parseFloat(balance.spent);
    if (allocated === 0) return 0;
    return Math.min((spent / allocated) * 100, 100);
  };

  const getProgressColor = (): string => {
    const percentage = getProgressPercentage();
    const available = balance ? parseFloat(balance.available) : 0;

    if (available < 0) return AppColors.overspent;
    if (percentage >= 80) return AppColors.cautionary;
    return AppColors.healthy;
  };

  const handleDelete = () => {
    setDeleteDialogVisible(false);
    if (onDelete) {
      onDelete(category);
    }
  };

  return (
    <>
      <Card style={styles.card} onPress={onPress ? () => onPress(category) : undefined} elevation={2}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.categoryIconContainer}>
              <MaterialCommunityIcons
                name="tag"
                size={24}
                color={AppColors.limeGreen}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text variant="titleMedium" style={styles.categoryName}>
                {category.name}
              </Text>
              {balance && (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={getProgressPercentage() / 100}
                    color={getProgressColor()}
                    style={styles.progressBar}
                  />
                  <Text variant="bodySmall" style={styles.progressText}>
                    {getProgressPercentage().toFixed(0)}% used
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => onEdit(category)}
                  iconColor={AppColors.oliveGreen}
                  style={styles.iconButton}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => setDeleteDialogVisible(true)}
                  iconColor={AppColors.coral}
                  style={styles.iconButton}
                />
              )}
            </View>
          </View>

          {balance ? (
            <View style={styles.balanceInfo}>
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <MaterialCommunityIcons
                    name="wallet"
                    size={16}
                    color={AppColors.textSecondary}
                  />
                  <Text variant="bodySmall" style={styles.balanceLabel}>
                    Allocated
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.balanceValue}>
                  ${parseFloat(balance.allocated).toFixed(2)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <MaterialCommunityIcons
                    name="cart"
                    size={16}
                    color={AppColors.textSecondary}
                  />
                  <Text variant="bodySmall" style={styles.balanceLabel}>
                    Spent
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.balanceValue}>
                  ${parseFloat(balance.spent).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.balanceRow, styles.availableRow]}>
                <View style={styles.balanceItem}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={16}
                    color={getAvailableColorForDisplay(balance.available)}
                  />
                  <Text variant="bodySmall" style={styles.balanceLabel}>
                    Available
                  </Text>
                </View>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.balanceValue,
                    styles.availableValue,
                    { color: getAvailableColorForDisplay(balance.available) },
                  ]}
                >
                  ${parseFloat(balance.available).toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.calculatingContainer}>
              <MaterialCommunityIcons
                name="loading"
                size={16}
                color={AppColors.textLight}
              />
              <Text variant="bodySmall" style={styles.calculating}>
                Calculating balances...
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Category</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Are you sure you want to delete "{category.name}"? This action cannot be undone and will remove all associated allocations.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} textColor={AppColors.textSecondary}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor={AppColors.coral}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.limeGreen}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    marginBottom: 8,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.surfaceVariant,
  },
  progressText: {
    color: AppColors.textSecondary,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
    marginTop: -8,
  },
  iconButton: {
    margin: 0,
  },
  balanceInfo: {
    gap: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  balanceValue: {
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  availableRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
    marginTop: 2,
  },
  availableValue: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  calculatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  calculating: {
    color: AppColors.textLight,
    fontStyle: 'italic',
  },
  dialog: {
    backgroundColor: AppColors.dialogBackground,
  },
  dialogTitle: {
    color: AppColors.textPrimary,
  },
  dialogText: {
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
});
