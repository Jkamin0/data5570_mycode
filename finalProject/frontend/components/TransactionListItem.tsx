import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Dialog, Portal, Button } from 'react-native-paper';
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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.container}>
            <MaterialCommunityIcons
              name={getIconName()}
              size={32}
              color={getIconColor()}
              style={styles.icon}
            />

            <View style={styles.content}>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(transaction.date)}
              </Text>
              <Text variant="titleMedium" style={styles.category}>
                {transaction.category_name || 'Uncategorized'}
              </Text>
              <Text variant="bodySmall" style={styles.account}>
                {transaction.account_name}
              </Text>
              {transaction.description && (
                <Text variant="bodySmall" style={styles.description}>
                  {transaction.description}
                </Text>
              )}
            </View>

            <View style={styles.rightSection}>
              <Text
                variant="titleLarge"
                style={[styles.amount, { color: getAmountColor() }]}
              >
                {transaction.transaction_type === 'income' ? '+' : '-'}$
                {parseFloat(transaction.amount).toFixed(2)}
              </Text>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => setDeleteDialogVisible(true)}
                iconColor={AppColors.coral}
              />
            </View>
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
            <Text style={styles.dialogText}>
              Are you sure you want to delete this transaction? This will reverse the account
              balance change.
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
    elevation: 2,
    backgroundColor: AppColors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  date: {
    color: AppColors.textSecondary,
  },
  category: {
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  account: {
    color: AppColors.textSecondary,
  },
  description: {
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontWeight: '700',
    marginBottom: 4,
  },
  dialog: {
    backgroundColor: AppColors.dialogBackground,
  },
  dialogTitle: {
    color: AppColors.textPrimary,
  },
  dialogText: {
    color: AppColors.textSecondary,
  },
});
