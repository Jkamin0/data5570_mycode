import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  fetchHabits,
  createHabit,
  deleteHabit,
  toggleHabitToday,
} from '../../store/habitsSlice';
import AnimatedCheckbox from '../../components/AnimatedCheckbox';
import FloatingActionButton from '../../components/FloatingActionButton';
import StyledInput from '../../components/StyledInput';
import GradientButton from '../../components/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function HabitsListScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { habits, loading } = useSelector((state) => state.habits);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');

  useEffect(() => {
    dispatch(fetchHabits());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await dispatch(fetchHabits());
    setRefreshing(false);
  };

  const handleToggle = async (habitId, currentStreak) => {
    try {
      await dispatch(toggleHabitToday(habitId)).unwrap();

      if (currentStreak > 0 && currentStreak % 7 === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) {
      return;
    }

    try {
      await dispatch(
        createHabit({
          name: newHabitName,
          description: newHabitDescription,
        })
      ).unwrap();
      setModalVisible(false);
      setNewHabitName('');
      setNewHabitDescription('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const errorMessage = error?.name?.[0] || error?.error || 'Failed to create habit';
      Alert.alert(
        'Error',
        errorMessage.includes('unique') || errorMessage.includes('exists')
          ? 'A habit with this name already exists'
          : errorMessage
      );
    }
  };

  const handleDeleteHabit = (habit) => {
    Alert.alert('Delete Habit', `Are you sure you want to delete "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteHabit(habit.id)).unwrap();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  const renderHabit = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)} exiting={FadeOutUp}>
      <TouchableOpacity
        style={styles.habitCard}
        onPress={() => router.push(`/habit/${item.id}`)}
        onLongPress={() => handleDeleteHabit(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[COLORS.background.secondary, COLORS.background.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.habitGradient}
        >
          <View style={styles.habitContent}>
            <View style={styles.habitInfo}>
              <View style={[styles.colorBar, { backgroundColor: item.color }]} />
              <View style={styles.habitText}>
                <Text style={styles.habitName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.habitDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.streakContainer}>
                  <LinearGradient
                    colors={COLORS.streak.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.streakBadge}
                  >
                    <Ionicons name="flame" size={14} color={COLORS.text.inverse} />
                    <Text style={styles.streakText}>
                      {item.current_streak} day{item.current_streak !== 1 ? 's' : ''}
                    </Text>
                  </LinearGradient>
                  {item.longest_streak > 0 && (
                    <View style={styles.bestStreakBadge}>
                      <Ionicons name="trophy-outline" size={12} color={COLORS.warning.main} />
                      <Text style={styles.bestStreakText}>Best: {item.longest_streak}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <AnimatedCheckbox
              checked={item.today_completed}
              onPress={() => handleToggle(item.id, item.current_streak)}
              color={item.color}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={COLORS.primary.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="rocket-outline" size={48} color={COLORS.text.inverse} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Start Your Journey</Text>
      <Text style={styles.emptyText}>
        Create your first habit and begin building a better you, one day at a time
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.primary.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.text.inverse} />
          <Text style={styles.emptyButtonText}>Create First Habit</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const completedToday = habits.filter((h) => h.today_completed).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary.light + '40', COLORS.background.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>My Habits</Text>
            {habits.length > 0 && (
              <Text style={styles.subtitle}>
                {completedToday} of {habits.length} completed today
              </Text>
            )}
          </View>
          {habits.length > 0 && (
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{completionPercentage}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {habits.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary.main}
              colors={[COLORS.primary.main]}
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {habits.length > 0 && (
        <FloatingActionButton onPress={() => setModalVisible(true)} icon="add" />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Habit</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-circle" size={28} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <StyledInput
              placeholder="Habit name *"
              value={newHabitName}
              onChangeText={setNewHabitName}
              icon="text-outline"
            />

            <StyledInput
              placeholder="Description (optional)"
              value={newHabitDescription}
              onChangeText={setNewHabitDescription}
              multiline
              numberOfLines={3}
              style={styles.textArea}
              icon="document-text-outline"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setNewHabitName('');
                  setNewHabitDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <GradientButton
                title="Create Habit"
                onPress={handleAddHabit}
                disabled={!newHabitName.trim()}
                style={styles.createButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerGradient: {
    paddingTop: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
  },
  list: {
    padding: SPACING.base,
    paddingBottom: 100,
  },
  habitCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  habitGradient: {
    padding: SPACING.base,
  },
  habitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: SPACING.md,
  },
  colorBar: {
    width: 4,
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  habitText: {
    flex: 1,
  },
  habitName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  streakText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bestStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bestStreakText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.sizes.md,
  },
  emptyButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderWidth: 2,
    borderColor: COLORS.border.medium,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
  createButton: {
    flex: 1,
  },
});
