import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import {
  Dialog,
  Portal,
  TextInput,
  Button,
  HelperText,
  Text,
  List,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import type {
  Account,
  Category,
  CategoryBalance,
  TransactionType,
  CreateTransactionPayload,
} from '../types/models';

interface CreateTransactionDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (payload: CreateTransactionPayload) => Promise<void>;
  accounts: Account[];
  categories: Category[];
  balances: CategoryBalance[];
}

interface FormData {
  transactionType: TransactionType;
  accountId: number | null;
  categoryId: number | null;
  amount: string;
  description: string;
}

interface ValidationErrors {
  accountId?: string;
  categoryId?: string;
  amount?: string;
  description?: string;
}

export default function CreateTransactionDialog({
  visible,
  onDismiss,
  onSubmit,
  accounts,
  categories,
  balances,
}: CreateTransactionDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    transactionType: 'expense',
    accountId: null,
    categoryId: null,
    amount: '',
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  const getCategoryAvailable = (categoryId: number | null): number => {
    if (categoryId === null) return 0;
    const balance = balances.find((b) => b.category_id === categoryId);
    return balance ? parseFloat(balance.available) : 0;
  };

  const handleClose = () => {
    setFormData({
      transactionType: 'expense',
      accountId: null,
      categoryId: null,
      amount: '',
      description: '',
    });
    setValidationErrors({});
    setSubmitting(false);
    onDismiss();
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      transactionType: value as TransactionType,
      categoryId: value === 'income' ? null : formData.categoryId,
    });
    if (value === 'income') {
      setValidationErrors({ ...validationErrors, categoryId: undefined });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    const selectedAccount = accounts.find((a) => a.id === formData.accountId);

    if (formData.accountId === null) {
      errors.accountId = 'Account is required';
    } else if (!selectedAccount) {
      errors.accountId = 'Please select a valid account';
    }

    if (formData.transactionType === 'expense' && formData.categoryId === null) {
      errors.categoryId = categories.length === 0 ? 'Create a category first' : 'Category is required for expenses';
    }

    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum)) {
        errors.amount = 'Amount must be a valid number';
      } else if (amountNum <= 0) {
        errors.amount = 'Amount must be greater than zero';
      } else if (formData.transactionType === 'expense' && balances.length > 0) {
        const available = getCategoryAvailable(formData.categoryId);
        if (available <= 0) {
          errors.amount = 'Allocate funds to this category before spending';
        } else if (amountNum > available) {
          errors.amount = `Amount exceeds available in category ($${available.toFixed(2)})`;
        }
      }
    }

    if (formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTransactionPayload = {
        account: formData.accountId!,
        category: formData.transactionType === 'expense' ? formData.categoryId : null,
        transaction_type: formData.transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || undefined,
      };
      await onSubmit(payload);
      handleClose();
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>Add Transaction</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.form}>
              <Text variant="labelMedium" style={styles.label}>
                Transaction Type
              </Text>
              <SegmentedButtons
                value={formData.transactionType}
                onValueChange={handleTypeChange}
                buttons={[
                  {
                    value: 'expense',
                    label: 'Expense',
                    icon: 'minus-circle',
                  },
                  {
                    value: 'income',
                    label: 'Income',
                    icon: 'plus-circle',
                  },
                ]}
                style={styles.segmentedButtons}
                disabled={submitting}
              />

              <Pressable onPress={() => !submitting && setAccountMenuVisible(true)}>
                <TextInput
                  label="Account"
                  value={
                    selectedAccount ? `${selectedAccount.name} ($${selectedAccount.balance})` : ''
                  }
                  error={!!validationErrors.accountId}
                  disabled={submitting}
                  style={styles.input}
                  placeholder="Select an account"
                  right={<TextInput.Icon icon="menu-down" />}
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>
              {validationErrors.accountId && (
                <HelperText type="error">{validationErrors.accountId}</HelperText>
              )}

              {formData.transactionType === 'expense' && (
                <>
                  <Pressable onPress={() => !submitting && setCategoryMenuVisible(true)}>
                    <TextInput
                      label="Category"
                      value={selectedCategory?.name || ''}
                      error={!!validationErrors.categoryId}
                      disabled={submitting}
                      style={styles.input}
                      placeholder="Select a category"
                      right={<TextInput.Icon icon="menu-down" />}
                      editable={false}
                      pointerEvents="none"
                    />
                  </Pressable>
                  {validationErrors.categoryId && (
                    <HelperText type="error">{validationErrors.categoryId}</HelperText>
                  )}
                </>
              )}

              <TextInput
                label="Amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                error={!!validationErrors.amount}
                disabled={submitting}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0.00"
                left={<TextInput.Affix text="$" />}
              />
              {validationErrors.amount && (
                <HelperText type="error">{validationErrors.amount}</HelperText>
              )}
              {formData.transactionType === 'expense' && selectedCategory && balances.length > 0 && (
                <Text variant="bodySmall" style={styles.helperText}>
                  Category available: ${getCategoryAvailable(formData.categoryId).toFixed(2)}
                </Text>
              )}
              {selectedAccount && (
                <Text variant="bodySmall" style={styles.helperText}>
                  Account balance: ${parseFloat(selectedAccount.balance || '0').toFixed(2)}
                </Text>
              )}

              <TextInput
                label="Description (Optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                error={!!validationErrors.description}
                disabled={submitting}
                style={styles.input}
                placeholder="e.g., Grocery shopping"
                multiline
                numberOfLines={3}
              />
              {validationErrors.description && (
                <HelperText type="error">{validationErrors.description}</HelperText>
              )}
              <Text variant="bodySmall" style={styles.helperText}>
                {formData.description.length}/500
              </Text>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} loading={submitting} disabled={submitting}>
            Add
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Modal
        visible={accountMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAccountMenuVisible(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Account</Text>
            <Divider />
            <ScrollView style={styles.pickerScroll}>
              {accounts.length === 0 ? (
                <List.Item title="No accounts available" disabled />
              ) : (
                accounts.map((account) => (
                  <List.Item
                    key={account.id}
                    title={account.name}
                    description={`$${parseFloat(account.balance).toFixed(2)}`}
                    onPress={() => {
                      setFormData({ ...formData, accountId: account.id });
                      setAccountMenuVisible(false);
                      setValidationErrors({ ...validationErrors, accountId: undefined });
                    }}
                    style={styles.listItem}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={categoryMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryMenuVisible(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            <Divider />
            <ScrollView style={styles.pickerScroll}>
              {categories.length === 0 ? (
                <List.Item title="No categories available" disabled />
              ) : (
                categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    onPress={() => {
                      setFormData({ ...formData, categoryId: category.id });
                      setCategoryMenuVisible(false);
                      setValidationErrors({ ...validationErrors, categoryId: undefined });
                    }}
                    style={styles.listItem}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  label: {
    marginBottom: 4,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: -4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    maxHeight: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  pickerScroll: {
    maxHeight: 320,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
