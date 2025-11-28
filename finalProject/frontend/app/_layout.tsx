import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import store from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStatus } from '../store/slices/authSlice';

function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialCheckDone } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!initialCheckDone) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, initialCheckDone, segments, router]);

  if (!initialCheckDone) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </ReduxProvider>
  );
}
