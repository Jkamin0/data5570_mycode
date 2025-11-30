import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Dialog, Portal, Button } from 'react-native-paper';
import type { Category, CategoryBalance } from '../types/models';

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

  const getAvailableColor = (available: string | undefined): string => {
    if (!available) return '#999';
    const availableNum = parseFloat(available);
    if (availableNum > 0) return '#4CAF50';
    if (availableNum < 0) return '#F44336';
    return '#999';
  };

  const handleDelete = () => {
    setDeleteDialogVisible(false);
    if (onDelete) {
      onDelete(category);
    }
  };

  return (
    <>
      <Card style={styles.card} onPress={onPress ? () => onPress(category) : undefined}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.actions}>
              {onEdit && (
                <IconButton icon="pencil" size={20} onPress={() => onEdit(category)} />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => setDeleteDialogVisible(true)}
                />
              )}
            </View>
          </View>

          {balance ? (
            <View style={styles.balanceInfo}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Allocated:</Text>
                <Text style={styles.balanceValue}>${balance.allocated}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Spent:</Text>
                <Text style={styles.balanceValue}>${balance.spent}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Available:</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    styles.availableValue,
                    { color: getAvailableColor(balance.available) },
                  ]}
                >
                  ${balance.available}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.calculating}>Calculating...</Text>
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Category</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{category.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  balanceInfo: {
    gap: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  availableValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  calculating: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
