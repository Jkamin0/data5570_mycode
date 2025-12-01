import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '../../theme/colors';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: AppColors.surface,
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTintColor: AppColors.textPrimary,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textSecondary,
        tabBarStyle: {
          backgroundColor: AppColors.surface,
          borderTopColor: AppColors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bank" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
