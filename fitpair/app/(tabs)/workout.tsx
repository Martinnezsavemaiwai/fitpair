/**
 * app/(tabs)/workout.tsx — Workout Detail
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Palette, Space, FontSize, Radius, Font, Anim, Shadow,
  userColor, userColorLt, userColorDim,
} from "@/constants/DS";
import { useApp } from "@/context/AppContext";
import { AlertTriangle, Lightbulb, PartyPopper, Check, Timer as TimerIcon, Play, Pause, Clock, Zap, X, Flame, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── EXERCISE DATA ────────────────────────────────────────────────

interface Exercise {
  name: string;
  detail: string;
  muscle: string;
  hasTimer: boolean;
  timerDuration?: number;
  safeForAnemia: boolean;
}

const EXERCISES_ME: Exercise[] = [
  { name: "Push-ups",            detail: "3 เซต · จนเกือบไม่ไหว",  muscle: "อก · ไหล่ · หลัง",    hasTimer: false, safeForAnemia: true },
  { name: "Bodyweight Squats",   detail: "4 เซต · 20 ครั้ง",        muscle: "ขา · สะโพก · Core",   hasTimer: false, safeForAnemia: true },
  { name: "Hanging Leg Raises",  detail: "4 เซต · 15 ครั้ง",        muscle: "หน้าท้องล่าง (Focus)",   hasTimer: false, safeForAnemia: true },
  { name: "Plank",               detail: "3 เซต · 60 วินาที",       muscle: "Core ทั้งหมด",         hasTimer: true,  timerDuration: 60, safeForAnemia: false },
];

const EXERCISES_PARTNER: Exercise[] = [
  { name: "Dead Bug",       detail: "3 เซต · 12 ครั้ง",       muscle: "Deep core (ปลอดภัย)", hasTimer: false, safeForAnemia: true },
  { name: "Pelvic Tilt",   detail: "3 เซต · 15 ครั้ง",        muscle: "หน้าท้องล่าง",         hasTimer: false, safeForAnemia: true },
  { name: "Glute Bridge",  detail: "3 เซต · 15 ครั้ง",        muscle: "สะโพก · ปรับบุคลิก",   hasTimer: false, safeForAnemia: true },
  { name: "Plank (short)", detail: "2 เซต · 30 วินาที",        muscle: "Core ทั้งหมด",         hasTimer: true,  timerDuration: 30, safeForAnemia: false },
];

// ─── TIMER HOOK ───────────────────────────────────────────────────

function useCountdownTimer(initial: number) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback((newVal?: number) => {
    pause();
    setSeconds(newVal ?? initial);
  }, [initial, pause]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { seconds, running, start, pause, reset, done: seconds === 0 };
}

// ─── EXERCISE ROW ─────────────────────────────────────────────────

function ExerciseRow({
  exercise,
  isDone,
  isActive,
  color,
  colorLt,
  onPress,
}: {
  exercise: Exercise;
  index: number;
  isDone: boolean;
  isActive: boolean;
  color: string;
  colorLt: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        row.container,
        isDone   && { backgroundColor: colorLt, borderColor: color + "66" },
        isActive && !isDone && { borderColor: color },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={row.nameRow}>
          <Text style={[row.name, isDone && { color }]}>{exercise.name}</Text>
          {isDone && (
            <View style={[row.doneBadge, { backgroundColor: color + "22" }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Check size={12} color={color} strokeWidth={3} />
                <Text style={[row.doneBadgeText, { color }]}>เสร็จ</Text>
              </View>
            </View>
          )}
        </View>
        <Text style={row.detail}>{exercise.detail}</Text>
        <Text style={[row.muscle, { color }]}>→ {exercise.muscle}</Text>
      </View>

      <View style={[row.action, { backgroundColor: isDone ? color + "22" : color }]}>
        {isDone ? (
          <Check size={18} color={color} strokeWidth={3} />
        ) : exercise.hasTimer ? (
          <TimerIcon size={18} color={Palette.surface} />
        ) : (
          <Play size={18} color={Palette.surface} fill={Palette.surface} />
        )}
      </View>
    </Pressable>
  );
}

const row = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sp4,
    padding: Space.sp4,
    backgroundColor: Palette.surface,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Palette.divider,
    marginBottom: Space.sp2,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: Space.sp2, marginBottom: 3 },
  name: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.ink,
  },
  detail: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkMid,
    marginBottom: 3,
  },
  muscle: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  doneBadge: {
    paddingHorizontal: Space.sp2,
    paddingVertical: 2,
    borderRadius: Radius.r1,
  },
  doneBadgeText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  action: {
    width: 34,
    height: 34,
    borderRadius: Radius.r1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

// ─── TIMER CARD ───────────────────────────────────────────────────

function TimerCard({
  timer,
  color,
  colorDim,
  onStart,
  onPause,
  onReset,
  onDone,
}: {
  timer: ReturnType<typeof useCountdownTimer>;
  color: string;
  colorDim: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    if (timer.done) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDone();
    }
  }, [timer.done, onDone]);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[tc.card, { backgroundColor: colorDim }]}
    >
      <Text style={[tc.label, { color }]}>Plank Timer</Text>
      <Text style={[tc.time, { color: timer.seconds <= 10 ? Palette.danger : Palette.ink }]}>
        {timer.seconds}s
      </Text>

      <View style={tc.btnRow}>
        <Pressable
          style={[tc.btn, { backgroundColor: color }]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            timer.running ? onPause() : onStart();
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {timer.running ? (
              <Pause size={18} color={Palette.surface} fill={Palette.surface} />
            ) : (
              <Play size={18} color={Palette.surface} fill={Palette.surface} />
            )}
            <Text style={tc.btnText}>{timer.running ? "Pause" : "เริ่ม"}</Text>
          </View>
        </Pressable>
        <Pressable
          style={tc.btnGhost}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onReset();
          }}
        >
          <Text style={[tc.btnGhostText, { color: Palette.inkMid }]}>Reset</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const tc = StyleSheet.create({
  card: {
    borderRadius: Radius.r3,
    padding: Space.sp5,
    marginBottom: Space.sp4,
    alignItems: "center",
    gap: Space.sp2,
  },
  label: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  time: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.mega,
    letterSpacing: -1,
    lineHeight: FontSize.mega * 1.1,
  },
  btnRow: { flexDirection: "row", gap: Space.sp3, marginTop: Space.sp2 },
  btn: {
    paddingVertical: Space.sp2,
    paddingHorizontal: Space.sp5,
    borderRadius: Radius.r2,
  },
  btnText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
    color: Palette.surface,
  },
  btnGhost: { padding: Space.sp2, justifyContent: "center" },
  btnGhostText: { fontFamily: Font.displayMedium, fontSize: FontSize.sm },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function Workout() {
  const { state, completeExercise, isExerciseDone } = useApp();
  const [showSummary, setShowSummary] = useState(false);
  const { activeUser } = state;

  const color    = userColor(activeUser);
  const colorLt  = userColorLt(activeUser);
  const colorDim = userColorDim(activeUser);

  const exercises =
    activeUser === "me" ? EXERCISES_ME : EXERCISES_PARTNER;

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const plankDuration =
    exercises.find((e) => e.hasTimer)?.timerDuration ?? 60;

  const timer = useCountdownTimer(plankDuration);

  const doneCount = exercises?.filter((_, i) => isExerciseDone(i)).length ?? 0;
  const pct = (exercises?.length ?? 0) > 0 ? doneCount / exercises.length : 0;

  const barWidth = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }));
  useEffect(() => {
    barWidth.value = withTiming(pct, { duration: Anim.normal });
  }, [pct, barWidth]);

  const handleExercisePress = useCallback(
    async (ex: Exercise, idx: number) => {
      if (isExerciseDone(idx)) return;
      setActiveIdx(idx);
      if (ex.hasTimer) {
        timer.reset(ex.timerDuration);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        completeExercise(idx);
        if (doneCount + 1 >= (exercises?.length ?? 0)) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    },
    [isExerciseDone, timer, completeExercise, doneCount, exercises?.length]
  );

  const handleTimerDone = useCallback(() => {
    if (activeIdx !== null) completeExercise(activeIdx);
  }, [activeIdx, completeExercise]);

  const profile = state[activeUser];
  const hasAnemia = profile?.healthFlags?.includes("anemia") ?? false;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(Anim.slow)} style={s.header}>
        <Text style={s.title}>Strength + Core</Text>
        <Text style={s.subtitle}>45 นาที · {new Date().toLocaleDateString("th-TH", { weekday: "long" })}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(Anim.slow)} style={s.progressArea}>
        <View style={s.progressTop}>
          <Text style={s.progressLabel}>ความคืบหน้า</Text>
          <Text style={[s.progressCount, { color }]}>{doneCount}/{exercises?.length ?? 0}</Text>
        </View>
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { backgroundColor: color }, barStyle]} />
        </View>
      </Animated.View>

      {activeIdx !== null && exercises?.[activeIdx]?.hasTimer && !isExerciseDone(activeIdx) && (
        <TimerCard
          timer={timer}
          color={color}
          colorDim={colorDim}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={() => timer.reset(plankDuration)}
          onDone={handleTimerDone}
        />
      )}

      <Text style={s.sectionLabel}>
        ท่าออกกำลังกาย · {exercises?.length ?? 0} ท่า
      </Text>

      {exercises?.map((ex, i) => (
        <Animated.View
          key={ex.name}
          entering={FadeInDown.delay(100 + i * 60).duration(Anim.slow)}
        >
          <ExerciseRow
            exercise={ex}
            index={i}
            isDone={isExerciseDone(i)}
            isActive={activeIdx === i}
            color={color}
            colorLt={colorLt}
            onPress={() => handleExercisePress(ex, i)}
          />
        </Animated.View>
      ))}

      {hasAnemia && (
        <View style={s.anemiaWarn}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AlertTriangle size={16} color={Palette.danger} strokeWidth={2.5} />
            <Text style={[s.anemiaWarnTitle, { marginBottom: 0 }]}>ข้อควรระวัง</Text>
          </View>
          <Text style={s.anemiaWarnText}>
            หากรู้สึกเวียนหัวหรือหน้ามืด ให้หยุดทันทีและนอนพักยกขาพิงกำแพง
          </Text>
        </View>
      )}

      {activeUser === "me" && (
        <View style={s.tip}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Lightbulb size={16} color={Palette.caution} strokeWidth={2.5} />
            <Text style={[s.tipTitle, { marginBottom: 0 }]}>Developer Tip</Text>
          </View>
          <Text style={s.tipText}>
            รอ Compile → ทำ Squat 10 ครั้งหรือ Plank 1 นาที สะสมความแข็งแรงระหว่างวัน
          </Text>
        </View>
      )}

      {pct >= 1 && (
        <Animated.View entering={FadeInDown.duration(Anim.normal)}>
          <Pressable
            style={[s.completeBtn, { backgroundColor: color }]}
            onPress={async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowSummary(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <PartyPopper size={20} color={Palette.surface} strokeWidth={2} />
              <Text style={s.completeBtnText}>Workout เสร็จแล้ว — บันทึก</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* ─── SUMMARY MODAL ────────────────────────────────────────── */}
      <Modal visible={showSummary} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={s.summaryModal}>
            <LinearGradient 
              colors={activeUser === 'me' ? [Palette.mossLt, Palette.surface] : [Palette.terraLt, Palette.surface]} 
              style={s.summaryGradient}
            >
              <View style={s.summaryHeader}>
                <Text style={s.summaryTitle}>ยอดเยี่ยม!</Text>
                <Pressable onPress={() => setShowSummary(false)} style={s.closeBtn}>
                  <X size={20} color={Palette.inkFaint} />
                </Pressable>
              </View>
              
              <View style={s.summaryVisual}>
                <Animated.View entering={FadeInDown.delay(200).springify()} style={[s.visualCircle, { backgroundColor: color }]}>
                  <Trophy size={48} color="white" />
                </Animated.View>
                <Text style={s.congratsText}>ภารกิจสำเร็จ!</Text>
              </View>

              <Text style={s.summarySub}>คุณได้สะสมสุขภาพที่ดีขึ้นอีกก้าวหนึ่งแล้ว</Text>
              
              <View style={s.summaryGrid}>
                <View style={s.summaryItem}>
                  <View style={[s.summaryIconBox, { backgroundColor: color + '15' }]}>
                    <Clock size={20} color={color} />
                  </View>
                  <Text style={s.summaryVal}>45</Text>
                  <Text style={s.summaryLabel}>นาที</Text>
                </View>
                <View style={s.summaryItem}>
                  <View style={[s.summaryIconBox, { backgroundColor: color + '15' }]}>
                    <Zap size={20} color={color} />
                  </View>
                  <Text style={s.summaryVal}>{exercises?.length}</Text>
                  <Text style={s.summaryLabel}>ท่า</Text>
                </View>
                <View style={s.summaryItem}>
                  <View style={[s.summaryIconBox, { backgroundColor: color + '15' }]}>
                    <Flame size={20} color={color} />
                  </View>
                  <Text style={s.summaryVal}>320</Text>
                  <Text style={s.summaryLabel}>kcal</Text>
                </View>
              </View>

              <Pressable 
                style={[s.summaryBtn, { backgroundColor: color }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowSummary(false);
                }}
              >
                <Text style={s.summaryBtnText}>เก่งมาก! กลับหน้าหลัก</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  scroll: { padding: Space.sp5, paddingTop: 56, paddingBottom: 100 },

  header: { marginBottom: Space.sp5 },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.xl,
    color: Palette.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkFaint,
  },

  progressArea: {
    marginBottom: Space.sp5,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Space.sp2,
  },
  progressLabel: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  progressCount: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
  },
  progressTrack: {
    height: 5,
    backgroundColor: Palette.divider,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  sectionLabel: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: Space.sp3,
  },

  anemiaWarn: {
    backgroundColor: Palette.dangerLt,
    borderRadius: Radius.r2,
    padding: Space.sp3,
    marginTop: Space.sp2,
    marginBottom: Space.sp4,
  },
  anemiaWarnTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
    color: Palette.danger,
    marginBottom: 4,
  },
  anemiaWarnText: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.danger,
    lineHeight: FontSize.sm * 1.5,
  },

  tip: {
    backgroundColor: Palette.cautionLt,
    borderRadius: Radius.r2,
    padding: Space.sp3,
    marginBottom: Space.sp5,
  },
  tipTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
    color: Palette.caution,
    marginBottom: 3,
  },
  tipText: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkMid,
    lineHeight: FontSize.sm * 1.6,
  },

  completeBtn: {
    paddingVertical: Space.sp3,
    borderRadius: Radius.r2,
    alignItems: "center",
    marginTop: Space.sp2,
  },
  completeBtnText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  summaryModal: {
    backgroundColor: Palette.surface,
    borderRadius: 32,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  summaryGradient: {
    padding: 24,
    alignItems: 'center',
  },
  summaryHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontFamily: Font.displayBold,
    fontSize: 20,
    color: Palette.ink,
  },
  closeBtn: {
    padding: 4,
  },
  summaryVisual: {
    alignItems: 'center',
    marginBottom: 24,
  },
  visualCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadow.md,
  },
  congratsText: {
    fontFamily: Font.displayBold,
    fontSize: 24,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  summarySub: {
    fontFamily: Font.body,
    fontSize: 15,
    color: Palette.inkMid,
    marginBottom: 32,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryVal: {
    fontFamily: Font.displayBold,
    fontSize: 20,
    color: Palette.ink,
  },
  summaryLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 11,
    color: Palette.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Shadow.sm,
  },
  summaryBtnText: {
    fontFamily: Font.displayBold,
    fontSize: 16,
    color: Palette.surface,
  },
});