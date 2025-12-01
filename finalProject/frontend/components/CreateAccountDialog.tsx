import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, HelperText, Text } from 'react-native-paper';
import { AppColors } from '../theme/colors';

interface CreateAccountDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (name: string, balance: number) => Promise<void>;
}

interface FormData {
  name: string;
  balance: string;
}

interface ValidationErrors {
  name?: string;
  balance?: string;
}

export default function CreateAccountDialog({
  visible,
  onDismiss,
  onSubmit,
}: CreateAccountDialogProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', balance: '' });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setFormData({ name: '', balance: '' });
    setValidationErrors({});
    setSubmitting(false);
    onDismiss();
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Account name is required';
    }

    if (!formData.balance.trim()) {
      errors.balance = 'Initial balance is required';
    } else {
      const balanceNum = parseFloat(formData.balance);
      if (isNaN(balanceNum)) {
        errors.balance = 'Balance must be a valid number';
      } else if (balanceNum < 0) {
        errors.balance = 'Balance cannot be negative';
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
      const balance = parseFloat(formData.balance);
      await onSubmit(formData.name.trim(), balance);
      handleClose();
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Create New Account</Dialog.Title>
        <Dialog.Content>
          <View style={styles.form}>
            <TextInput
              label="Account Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={!!validationErrors.name}
              disabled={submitting}
              style={styles.input}
              placeholder="e.g., Checking Account"
              mode="outlined"
              outlineColor={AppColors.border}
              activeOutlineColor={AppColors.primary}
              textColor={AppColors.textPrimary}
              placeholderTextColor={AppColors.textLight}
            />
            {validationErrors.name && (
              <HelperText type="error" style={styles.errorText}>
                {validationErrors.name}
              </HelperText>
            )}

            <TextInput
              label="Initial Balance"
              value={formData.balance}
              onChangeText={(text) => setFormData({ ...formData, balance: text })}
              error={!!validationErrors.balance}
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
            {validationErrors.balance && (
              <HelperText type="error" style={styles.errorText}>
                {validationErrors.balance}
              </HelperText>
            )}
          </View>
        </Dialog.Content>
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
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
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
    paddingTop: 8,
  },
  input: {
    backgroundColor: AppColors.inputBackground,
  },
  errorText: {
    marginTop: -12,
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
});
