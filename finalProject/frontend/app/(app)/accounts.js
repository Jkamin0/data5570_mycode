import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

export default function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Accounts
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            This is a placeholder for the accounts screen. Here you'll be able to:
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • View all your accounts
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Create new accounts
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • Edit existing accounts
          </Text>
          <Text variant="bodyMedium" style={styles.listItem}>
            • View account balances
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
