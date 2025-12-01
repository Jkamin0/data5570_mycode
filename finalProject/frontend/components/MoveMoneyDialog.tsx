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
} from 'react-native-paper';
import type { Account, Category, CategoryBalance, MoveMoneyPayload } from '../types/models';
import { AppColors, getAvailableColor } from '../theme/colors';

interface MoveMoneyDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (payload: MoveMoneyPayload) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  balances: CategoryBalance[];
}

interface FormData {
  sourceCategoryId: number | null;
  targetCategoryId: number | null;
  accountId: number | null;
  amount: string;
}

interface ValidationErrors {
  sourceCategoryId?: string;
  targetCategoryId?: string;
  accountId?: string;
  amount?: string;
}

export default function MoveMoneyDialog({
  visible,
  onDismiss,
  onSubmit,
  categories,
  accounts,
  balances,
}: MoveMoneyDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    sourceCategoryId: null,
    targetCategoryId: null,
    accountId: null,
    amount: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const selectedSourceCategory = categories.find((c) => c.id === formData.sourceCategoryId);
  const selectedTargetCategory = categories.find((c) => c.id === formData.targetCategoryId);
  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const sourceBalance = balances.find((b) => b.category_id === formData.sourceCategoryId);

  const handleClose = () => {
    setFormData({
      sourceCategoryId: null,
      targetCategoryId: null,
      accountId: null,
      amount: '',
    });
    setValidationErrors({});
    setSubmitting(false);
    onDismiss();
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (formData.sourceCategoryId === null) {
      errors.sourceCategoryId = 'Source category is required';
    }

    if (formData.targetCategoryId === null) {
      errors.targetCategoryId = 'Target category is required';
    }

    if (formData.sourceCategoryId !== null && formData.targetCategoryId !== null) {
      if (formData.sourceCategoryId === formData.targetCategoryId) {
        errors.targetCategoryId = 'Target category must be different from source';
      }
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
      } else if (sourceBalance) {
        const available = parseFloat(sourceBalance.available);
        if (amountNum > available) {
          errors.amount = `Amount cannot exceed available balance ($${parseFloat(sourceBalance.available).toFixed(2)})`;
        }
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
      const payload: MoveMoneyPayload = {
        source_category: formData.sourceCategoryId!,
        target_category: formData.targetCategoryId!,
        account: formData.accountId!,
        amount: parseFloat(formData.amount),
      };
      await onSubmit(payload);
      handleClose();
    } catch (error) {
      setSubmitting(false);
    }
  };

  const getCategoryDisplayText = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    const balance = balances.find((b) => b.category_id === categoryId);
    if (!category) return '';
    if (!balance) return category.name;
    return `${category.name} ($${parseFloat(balance.available).toFixed(2)} available)`;
  };

  const getAvailableColorForDisplay = (available: string): string => {
    const availableNum = parseFloat(available);
    return getAvailableColor(availableNum);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Move Money</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.form}>
              <View>
                <Pressable onPress={() => !submitting && setSourceMenuVisible(true)}>
                  <TextInput
                    label="From Category"
                    value={selectedSourceCategory ? getCategoryDisplayText(formData.sourceCategoryId!) : ''}
                    error={!!validationErrors.sourceCategoryId}
                    disabled={submitting}
                    style={styles.input}
                    placeholder="Select source category"
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
                {validationErrors.sourceCategoryId && (
                  <HelperText type="error" style={styles.errorText}>
                    {validationErrors.sourceCategoryId}
                  </HelperText>
                )}
              </View>

              <View>
                <Pressable onPress={() => !submitting && setTargetMenuVisible(true)}>
                  <TextInput
                    label="To Category"
                    value={selectedTargetCategory?.name || ''}
                    error={!!validationErrors.targetCategoryId}
                    disabled={submitting}
                    style={styles.input}
                    placeholder="Select target category"
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
                {validationErrors.targetCategoryId && (
                  <HelperText type="error" style={styles.errorText}>
                    {validationErrors.targetCategoryId}
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
                    placeholder="Select account"
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
                {sourceBalance && (
                  <Text style={styles.helperText}>
                    Available in source: ${parseFloat(sourceBalance.available).toFixed(2)}
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
            Move Money
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Modal
        visible={sourceMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSourceMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSourceMenuVisible(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Source Category</Text>
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
                      titleStyle={styles.listItemText}
                      description={
                        balance
                          ? `$${parseFloat(balance.available).toFixed(2)} available`
                          : 'No balance info'
                      }
                      descriptionStyle={{
                        color: balance ? getAvailableColorForDisplay(balance.available) : AppColors.textLight,
                      }}
                      onPress={() => {
                        setFormData({ ...formData, sourceCategoryId: category.id });
                        setSourceMenuVisible(false);
                        setValidationErrors({ ...validationErrors, sourceCategoryId: undefined });
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

      <Modal
        visible={targetMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTargetMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTargetMenuVisible(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Target Category</Text>
            <Divider style={styles.divider} />
            <ScrollView style={styles.pickerScroll}>
              {categories.length === 0 ? (
                <List.Item
                  title="No categories available"
                  disabled
                  titleStyle={styles.listItemText}
                />
              ) : (
                categories
                  .filter((c) => c.id !== formData.sourceCategoryId)
                  .map((category) => (
                    <List.Item
                      key={category.id}
                      title={category.name}
                      titleStyle={styles.listItemText}
                      onPress={() => {
                        setFormData({ ...formData, targetCategoryId: category.id });
                        setTargetMenuVisible(false);
                        setValidationErrors({ ...validationErrors, targetCategoryId: undefined });
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
