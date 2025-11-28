import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Budget
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            This is a placeholder for the budget screen. Here you'll be able to:
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • View all budget categories
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Create new categories
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Allocate funds to categories
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Move money between categories
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Track category balances
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  listItem: {
    marginBottom: 8,
    color: '#666',
  },
});
