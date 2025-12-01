import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Dialog, Portal, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Transaction } from '../types/models';
import { AppColors, getTransactionColor } from '../theme/colors';

interface TransactionListItemProps {
  transaction: Transaction;
  onDelete: (id: number) => Promise<void>;
}

export default function TransactionListItem({
  transaction,
  onDelete,
}: TransactionListItemProps) {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAmountColor = (): string => {
    return getTransactionColor(transaction.transaction_type);
  };

  const getIconName = (): 'plus-circle' | 'minus-circle' => {
    return transaction.transaction_type === 'income' ? 'plus-circle' : 'minus-circle';
  };

  const getIconColor = (): string => {
    return getTransactionColor(transaction.transaction_type);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(transaction.id);
      setDeleteDialogVisible(false);
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getIconName()}
                size={32}
                color={getIconColor()}
              />
            </View>

            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(transaction.date)}
                </Text>
                <Text
                  variant="titleLarge"
                  style={[styles.amount, { color: getAmountColor() }]}
                >
                  {transaction.transaction_type === 'income' ? '+' : '-'}$
                  {parseFloat(transaction.amount).toFixed(2)}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="tag"
                    size={16}
                    color={AppColors.textSecondary}
                  />
                  <Text variant="titleMedium" style={styles.category}>
                    {transaction.category_name || 'Income'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="bank"
                    size={16}
                    color={AppColors.textSecondary}
                  />
                  <Text variant="bodyMedium" style={styles.account}>
                    {transaction.account_name}
                  </Text>
                </View>
              </View>

              {transaction.description && (
                <>
                  <Divider style={styles.divider} />
                  <View style={styles.descriptionContainer}>
                    <MaterialCommunityIcons
                      name="text"
                      size={16}
                      color={AppColors.textLight}
                    />
                    <Text variant="bodySmall" style={styles.description}>
                      {transaction.description}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <IconButton
              icon="delete"
              size={20}
              onPress={() => setDeleteDialogVisible(true)}
              iconColor={AppColors.coral}
              style={styles.deleteButton}
            />
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Transaction</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Are you sure you want to delete this transaction? This will reverse the account
              balance change and update category spending.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              disabled={deleting}
              textColor={AppColors.textSecondary}
            >
              Cancel
            </Button>
            <Button
              onPress={handleDelete}
              loading={deleting}
              disabled={deleting}
              textColor={AppColors.coral}
            >
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
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  infoContainer: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontWeight: '600',
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
  },
  account: {
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 4,
    backgroundColor: AppColors.divider,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 4,
  },
  description: {
    color: AppColors.textLight,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
  deleteButton: {
    margin: -8,
    marginTop: -4,
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
