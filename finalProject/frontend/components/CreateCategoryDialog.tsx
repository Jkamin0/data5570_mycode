import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, HelperText, Text } from 'react-native-paper';
import { AppColors } from '../theme/colors';

interface CreateCategoryDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialData?: { id?: number; name: string };
  mode?: 'create' | 'edit';
}

interface ValidationErrors {
  name?: string;
}

export default function CreateCategoryDialog({
  visible,
  onDismiss,
  onSubmit,
  initialData,
  mode = 'create',
}: CreateCategoryDialogProps) {
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      setName(initialData.name);
    }
  }, [visible, initialData]);

  const handleClose = () => {
    setName('');
    setValidationErrors({});
    setSubmitting(false);
    onDismiss();
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!name.trim()) {
      errors.name = 'Category name is required';
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
      await onSubmit(name.trim());
      handleClose();
    } catch (error) {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.title}>
          {mode === 'edit' ? 'Edit Category' : 'Create New Category'}
        </Dialog.Title>
        <Dialog.Content>
          <View style={styles.form}>
            <TextInput
              label="Category Name"
              value={name}
              onChangeText={setName}
              error={!!validationErrors.name}
              disabled={submitting}
              style={styles.input}
              placeholder="e.g., Groceries, Rent, Entertainment"
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
            {mode === 'edit' ? 'Update' : 'Create'}
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
