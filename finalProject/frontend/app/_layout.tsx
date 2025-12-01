import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import LoadingScreen from '../components/LoadingScreen';
import store from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStatus } from '../store/slices/authSlice';
import { customTheme } from '../theme/theme';

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
    const inLandingGroup = segments[0] === '(landing)';
    const inAppGroup = segments[0] === '(app)';

    if (!isAuthenticated && inAppGroup) {
      router.replace('/(landing)');
    } else if (!isAuthenticated && segments.length === 0) {
      router.replace('/(landing)');
    } else if (isAuthenticated && (inAuthGroup || inLandingGroup)) {
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
      <PaperProvider theme={customTheme}>
        <RootLayoutNav />
      </PaperProvider>
    </ReduxProvider>
  );
}
