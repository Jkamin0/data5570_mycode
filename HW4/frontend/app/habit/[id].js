import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { fetchHabit, fetchHabitLogs } from '../../store/habitsSlice';
import CircularProgress from '../../components/CircularProgress';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { habits, logs } = useSelector((state) => state.habits);
  const [loading, setLoading] = useState(false);
  const [fetchingHabit, setFetchingHabit] = useState(false);

  const habit = habits.find((h) => h.id === parseInt(id));
  const habitLogs = logs[id] || [];

  useEffect(() => {
    if (!habit && !fetchingHabit) {
      setFetchingHabit(true);
      dispatch(fetchHabit(id)).finally(() => setFetchingHabit(false));
    }
  }, [id, habit, fetchingHabit]);

  useEffect(() => {
    if (habit) {
      loadLogs();
    }
  }, [habit]);

  const loadLogs = async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    try {
      await dispatch(
        fetchHabitLogs({
          id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!habit) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={styles.loadingText}>
          {fetchingHabit ? 'Loading habit...' : 'Habit not found'}
        </Text>
      </SafeAreaView>
    );
  }

  const markedDates = {};
  habitLogs.forEach((log) => {
    if (log.completed) {
      markedDates[log.date] = {
        selected: true,
        selectedColor: habit.color,
        marked: true,
      };
    }
  });

  const completionRate =
    habitLogs.length > 0
      ? Math.round((habitLogs.filter((log) => log.completed).length / habitLogs.length) * 100)
      : 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[habit.color + '40', COLORS.background.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.habitHeader}>
            <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              {habit.description ? (
                <Text style={styles.habitDescription}>{habit.description}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={COLORS.streak.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="flame" size={28} color={COLORS.text.inverse} />
              <Text style={styles.statValue}>{habit.current_streak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={[COLORS.warning.light, COLORS.warning.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="trophy" size={28} color={COLORS.text.inverse} />
              <Text style={styles.statValue}>{habit.longest_streak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={COLORS.success.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="checkmark-circle" size={28} color={COLORS.text.inverse} />
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.progressRow}>
            <CircularProgress
              size={120}
              progress={completionRate}
              color={habit.color}
              value={`${completionRate}%`}
              label="Complete"
            />
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Activity Calendar</Text>
          {loading ? (
            <View style={styles.loadingCalendar}>
              <ActivityIndicator size="large" color={COLORS.primary.main} />
            </View>
          ) : (
            <>
              <Calendar
                markedDates={markedDates}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  todayTextColor: COLORS.primary.main,
                  arrowColor: COLORS.primary.main,
                  monthTextColor: COLORS.text.primary,
                  textMonthFontWeight: TYPOGRAPHY.weights.bold,
                  textMonthFontSize: TYPOGRAPHY.sizes.lg,
                  textDayFontSize: TYPOGRAPHY.sizes.base,
                  textDayHeaderFontSize: TYPOGRAPHY.sizes.sm,
                  textSectionTitleColor: COLORS.text.secondary,
                  selectedDayBackgroundColor: habit.color,
                  dotColor: habit.color,
                }}
              />
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
                  <Text style={styles.legendText}>Completed Days</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { borderWidth: 2, borderColor: COLORS.primary.main }]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.base,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  headerGradient: {
    paddingBottom: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: SPACING.base,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  statGradient: {
    padding: SPACING.base,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
    marginVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  progressCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginHorizontal: SPACING.base,
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
  calendarCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  loadingCalendar: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});
