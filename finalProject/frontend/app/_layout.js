import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutNav() {
  const dispatch = useDispatch();
  const { isAuthenticated, initialCheckDone } = useSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, []);

  useEffect(() => {
    if (!initialCheckDone) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, initialCheckDone, segments]);

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
