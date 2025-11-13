import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logout } from '../../store/authSlice';
import CircularProgress from '../../components/CircularProgress';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { habits } = useSelector((state) => state.habits);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await dispatch(logout());
    router.replace('/login');
  };

  const totalHabits = habits.length;
  const activeStreaks = habits.filter((h) => h.current_streak > 0).length;
  const totalCompletedToday = habits.filter((h) => h.today_completed).length;
  const completionRate = totalHabits > 0 ? Math.round((totalCompletedToday / totalHabits) * 100) : 0;

  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const longestStreak = Math.max(...habits.map((h) => h.longest_streak), 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={COLORS.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={COLORS.secondary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <CircularProgress
                size={100}
                progress={completionRate}
                color={COLORS.success.main}
                value={`${completionRate}%`}
                label="Complete"
              />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.primary.light + '40', COLORS.background.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="list-circle" size={32} color={COLORS.primary.main} />
              </View>
              <Text style={styles.statValue}>{totalHabits}</Text>
              <Text style={styles.statLabel}>Total Habits</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.success.light + '40', COLORS.background.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={32} color={COLORS.streak.fire} />
              </View>
              <Text style={styles.statValue}>{activeStreaks}</Text>
              <Text style={styles.statLabel}>Active Streaks</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.warning.light + '40', COLORS.background.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={32} color={COLORS.warning.main} />
              </View>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.secondary.light + '40', COLORS.background.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-done-circle" size={32} color={COLORS.secondary.main} />
              </View>
              <Text style={styles.statValue}>{totalCompletedToday}</Text>
              <Text style={styles.statLabel}>Done Today</Text>
            </LinearGradient>
          </View>
        </View>

        {totalStreak > 0 && (
          <View style={styles.achievementCard}>
            <LinearGradient
              colors={COLORS.streak.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.achievementGradient}
            >
              <Ionicons name="flash" size={40} color={COLORS.text.inverse} />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Total Momentum</Text>
                <Text style={styles.achievementValue}>{totalStreak} days of active habits</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.error.main, COLORS.error.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.text.inverse} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerGradient: {
    paddingBottom: SPACING.xxxl,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
  },
  userCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.base,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.text.inverse + '40',
    ...SHADOWS.lg,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.huge,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingTop: SPACING.xl,
  },
  progressSection: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.base,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  progressRow: {
    alignItems: 'center',
  },
  progressItem: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.base,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  statGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  statIconContainer: {
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  achievementCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.base,
    ...SHADOWS.md,
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.base,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  achievementValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
  },
  logoutButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  logoutButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
