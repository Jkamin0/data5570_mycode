import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeroSection from '../../components/landing/HeroSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FinalCTA from '../../components/landing/FinalCTA';
import { AppColors } from '../../theme/colors';

export default function LandingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
    >
      <HeroSection onGetStarted={handleGetStarted} onLogin={handleLogin} />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCTA onGetStarted={handleGetStarted} onLogin={handleLogin} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
