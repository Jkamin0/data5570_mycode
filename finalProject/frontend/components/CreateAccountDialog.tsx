import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, HelperText } from 'react-native-paper';

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
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>Create New Account</Dialog.Title>
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
            />
            {validationErrors.name && (
              <HelperText type="error">{validationErrors.name}</HelperText>
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
              left={<TextInput.Affix text="$" />}
            />
            {validationErrors.balance && (
              <HelperText type="error">{validationErrors.balance}</HelperText>
            )}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} loading={submitting} disabled={submitting}>
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
  },
  input: {
    marginBottom: 8,
  },
});
