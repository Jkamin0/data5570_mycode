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
} from 'react-native-paper';
import type { Account, Category } from '../types/models';
import { AppColors } from '../theme/colors';

interface AllocateFundsDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (categoryId: number, accountId: number, amount: number) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  preselectedCategoryId?: number;
  availableToBudget?: number;
}

interface FormData {
  categoryId: number | null;
  accountId: number | null;
  amount: string;
}

interface ValidationErrors {
  categoryId?: string;
  accountId?: string;
  amount?: string;
}

export default function AllocateFundsDialog({
  visible,
  onDismiss,
  onSubmit,
  categories,
  accounts,
  preselectedCategoryId,
  availableToBudget,
}: AllocateFundsDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    categoryId: null,
    accountId: null,
    amount: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedAccount = accounts.find((a) => a.id === formData.accountId);

  useEffect(() => {
    if (visible && preselectedCategoryId) {
      setFormData((prev) => ({ ...prev, categoryId: preselectedCategoryId }));
    }
  }, [visible, preselectedCategoryId]);

  const handleClose = () => {
    setFormData({ categoryId: null, accountId: null, amount: '' });
    setValidationErrors({});
    setSubmitting(false);
    onDismiss();
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (formData.categoryId === null) {
      errors.categoryId = 'Category is required';
    }

    if (formData.accountId === null) {
      errors.accountId = 'Account is required';
    }

    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum)) {
        errors.amount = 'Amount must be a valid number';
      } else if (amountNum <= 0) {
        errors.amount = 'Amount must be greater than zero';
      } else if (availableToBudget !== undefined && amountNum > availableToBudget) {
        errors.amount = `Amount cannot exceed available budget ($${availableToBudget.toFixed(2)})`;
      }
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
      const amount = parseFloat(formData.amount);
      await onSubmit(formData.categoryId!, formData.accountId!, amount);
      handleClose();
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Allocate Funds</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.form}>
              <View>
                <Pressable
                  onPress={() => !submitting && !preselectedCategoryId && setCategoryMenuVisible(true)}
                >
                  <TextInput
                    label="Category"
                    value={selectedCategory?.name || ''}
                    error={!!validationErrors.categoryId}
                    disabled={submitting || !!preselectedCategoryId}
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
              </View>

              <View>
                <Pressable onPress={() => !submitting && setAccountMenuVisible(true)}>
                  <TextInput
                    label="Account"
                    value={selectedAccount?.name || ''}
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
                    Account balance: ${parseFloat(selectedAccount.balance).toFixed(2)}
                  </Text>
                )}
              </View>

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
                {availableToBudget !== undefined && (
                  <Text style={styles.helperText}>
                    Available to Budget: ${availableToBudget.toFixed(2)}
                  </Text>
                )}
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
            Allocate
          </Button>
        </Dialog.Actions>
      </Dialog>

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
                categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    titleStyle={styles.listItemText}
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
