import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="counter" options={{ title: 'Counter' }} />
        <Stack.Screen name="todos" options={{ title: 'Todo List' }} />
      </Stack>
    </Provider>
  );
}
