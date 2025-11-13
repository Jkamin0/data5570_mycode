import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { loadUser } from '../store/authSlice';

function RootLayoutNav() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
