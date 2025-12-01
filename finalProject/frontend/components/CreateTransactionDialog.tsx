import { useState } from 'react';
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
import { AppColors } from '../theme/colors';

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
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Add Transaction</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.form}>
              <View>
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
                      disabled: submitting,
                    },
                    {
                      value: 'income',
                      label: 'Income',
                      icon: 'plus-circle',
                      disabled: submitting,
                    },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              <View>
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
                    mode="outlined"
                    outlineColor={AppColors.border}
                    activeOutlineColor={AppColors.primary}
                    textColor={AppColors.textPrimary}
                    placeholderTextColor={AppColors.textLight}
                    right={<TextInput.Icon icon="menu-down" />}
                    editable={false}
                    pointerEvents="none"
                  />
                </Pressable>
                {validationErrors.accountId && (
                  <HelperText type="error" style={styles.errorText}>
                    {validationErrors.accountId}
                  </HelperText>
                )}
                {selectedAccount && (
                  <Text variant="bodySmall" style={styles.helperText}>
                    Account balance: ${parseFloat(selectedAccount.balance || '0').toFixed(2)}
                  </Text>
                )}
              </View>

              {formData.transactionType === 'expense' && (
                <View>
                  <Pressable onPress={() => !submitting && setCategoryMenuVisible(true)}>
                    <TextInput
                      label="Category"
                      value={selectedCategory?.name || ''}
                      error={!!validationErrors.categoryId}
                      disabled={submitting}
                      style={styles.input}
                      placeholder="Select a category"
                      mode="outlined"
                      outlineColor={AppColors.border}
                      activeOutlineColor={AppColors.primary}
                      textColor={AppColors.textPrimary}
                      placeholderTextColor={AppColors.textLight}
                      right={<TextInput.Icon icon="menu-down" />}
                      editable={false}
                      pointerEvents="none"
                    />
                  </Pressable>
                  {validationErrors.categoryId && (
                    <HelperText type="error" style={styles.errorText}>
                      {validationErrors.categoryId}
                    </HelperText>
                  )}
                  {selectedCategory && balances.length > 0 && (
                    <Text variant="bodySmall" style={styles.helperText}>
                      Category available: ${getCategoryAvailable(formData.categoryId).toFixed(2)}
                    </Text>
                  )}
                </View>
              )}

              <View>
                <TextInput
                  label="Amount"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  error={!!validationErrors.amount}
                  disabled={submitting}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholder="0.00"
                  mode="outlined"
                  outlineColor={AppColors.border}
                  activeOutlineColor={AppColors.primary}
                  textColor={AppColors.textPrimary}
                  placeholderTextColor={AppColors.textLight}
                  left={<TextInput.Affix text="$" textStyle={{ color: AppColors.textSecondary }} />}
                />
                {validationErrors.amount && (
                  <HelperText type="error" style={styles.errorText}>
                    {validationErrors.amount}
                  </HelperText>
                )}
              </View>

              <View>
                <TextInput
                  label="Description (Optional)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  error={!!validationErrors.description}
                  disabled={submitting}
                  style={styles.input}
                  placeholder="e.g., Grocery shopping"
                  mode="outlined"
                  outlineColor={AppColors.border}
                  activeOutlineColor={AppColors.primary}
                  textColor={AppColors.textPrimary}
                  placeholderTextColor={AppColors.textLight}
                  multiline
                  numberOfLines={3}
                />
                {validationErrors.description && (
                  <HelperText type="error" style={styles.errorText}>
                    {validationErrors.description}
                  </HelperText>
                )}
                <Text variant="bodySmall" style={styles.helperText}>
                  {formData.description.length}/500
                </Text>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.actions}>
          <Button
            onPress={handleClose}
            disabled={submitting}
            textColor={AppColors.textSecondary}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            mode="contained"
            buttonColor={AppColors.primary}
            textColor={AppColors.textOnPrimary}
            style={styles.submitButton}
          >
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
            <Divider style={styles.divider} />
            <ScrollView style={styles.pickerScroll}>
              {accounts.length === 0 ? (
                <List.Item
                  title="No accounts available"
                  disabled
                  titleStyle={styles.listItemText}
                />
              ) : (
                accounts.map((account) => (
                  <List.Item
                    key={account.id}
                    title={account.name}
                    description={`$${parseFloat(account.balance).toFixed(2)}`}
                    titleStyle={styles.listItemText}
                    descriptionStyle={styles.listItemDescription}
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
            <Divider style={styles.divider} />
            <ScrollView style={styles.pickerScroll}>
              {categories.length === 0 ? (
                <List.Item
                  title="No categories available"
                  disabled
                  titleStyle={styles.listItemText}
                />
              ) : (
                categories.map((category) => {
                  const balance = balances.find((b) => b.category_id === category.id);
                  return (
                    <List.Item
                      key={category.id}
                      title={category.name}
                      description={balance ? `$${parseFloat(balance.available).toFixed(2)} available` : undefined}
                      titleStyle={styles.listItemText}
                      descriptionStyle={styles.listItemDescription}
                      onPress={() => {
                        setFormData({ ...formData, categoryId: category.id });
                        setCategoryMenuVisible(false);
                        setValidationErrors({ ...validationErrors, categoryId: undefined });
                      }}
                      style={styles.listItem}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: AppColors.dialogBackground,
    borderRadius: 8,
    width: '90%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  label: {
    marginBottom: 8,
    color: AppColors.textSecondary,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  input: {
    backgroundColor: AppColors.inputBackground,
  },
  errorText: {
    marginTop: -12,
  },
  helperText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    minWidth: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    maxHeight: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    color: AppColors.textPrimary,
  },
  pickerScroll: {
    maxHeight: 320,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
  },
  listItemText: {
    color: AppColors.textPrimary,
  },
  listItemDescription: {
    color: AppColors.textSecondary,
  },
  divider: {
    backgroundColor: AppColors.divider,
  },
});
