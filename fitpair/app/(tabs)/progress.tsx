/**
 * app/(tabs)/progress.tsx — Fitness & Health Analytics
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay, interpolate, Extrapolate } from "react-native-reanimated";
import {
  Palette,
  Space,
  FontSize,
  Radius,
  Font,
  Anim,
  Shadow,
  userColor,
  userColorLt,
} from "@/constants/DS";
import { useApp } from "@/context/AppContext";
import { 
  Dumbbell, 
  Flame, 
  Beef, 
  Moon, 
  Sparkles, 
  Droplet, 
  Milk, 
  Salad, 
  Heart 
} from 'lucide-react-native';

// ─── DATA ─────────────────────────────────────────────────────────

const WEEK_DATA = { 
  me: [3, 4, 2, 5, 4, 6, 4], 
  partner: [1, 2, 1, 2, 3, 2, 1] 
};

const DAY_LABELS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

const KPI = {
  me: [
    { label: "Workout Days", value: "18", unit: "วัน", sub: "เดือนนี้", icon: Dumbbell },
    { label: "Current Streak", value: "5", unit: "วัน", sub: "ติดต่อกัน", icon: Flame },
    { label: "Protein Avg", value: "98", unit: "g", sub: "เป้า 100g", icon: Beef },
    { label: "Sleep Avg", value: "7.4", unit: "h", sub: "เป้า 7.5h", icon: Moon },
  ],
  partner: [
    { label: "Workout Days", value: "8", unit: "วัน", sub: "เดือนนี้", icon: Sparkles },
    { label: "Water", value: "state.checksPartner.water", unit: "แก้ว", sub: "วันนี้", icon: Droplet, dynamic: true },
    { label: "Protein Avg", value: "72", unit: "g", sub: "เป้า 80g", icon: Milk },
    { label: "Sleep Avg", value: "8.2", unit: "h", sub: "เป้า 8.5h", icon: Moon },
  ],
};

const KPI_LIST = (user: "me" | "partner", state: any) => {
  const list = user === "me" ? [
    { label: "Workout Days", value: "18", unit: "วัน", sub: "เดือนนี้", icon: Dumbbell },
    { label: "Current Streak", value: "5", unit: "วัน", sub: "ติดต่อกัน", icon: Flame },
    { label: "Water", value: state.checksMe.water, unit: "แก้ว", sub: "วันนี้", icon: Droplet },
    { label: "Sleep Avg", value: "7.4", unit: "h", sub: "เป้า 7.5h", icon: Moon },
  ] : [
    { label: "Workout Days", value: "8", unit: "วัน", sub: "เดือนนี้", icon: Sparkles },
    { label: "Water", value: state.checksPartner.water, unit: "แก้ว", sub: "วันนี้", icon: Droplet },
    { label: "Protein Avg", value: "72", unit: "g", sub: "เป้า 80g", icon: Milk },
    { label: "Sleep Avg", value: "8.2", unit: "h", sub: "เป้า 8.5h", icon: Moon },
  ];
  return list;
};

const ACHIEVEMENTS = [
  { icon: Flame, label: "5-Day\nStreak", earned: true },
  { icon: Dumbbell, label: "First\nWorkout", earned: true },
  { icon: Salad, label: "Meal\nLogged", earned: true },
  { icon: Heart, label: "Couple\nSync", earned: false },
];

// ─── COMPONENTS ───────────────────────────────────────────────────

function KPICard({ item, color, colorLt, delay }: { item: any; color: string; colorLt: string; delay: number }) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(Anim.normal)}
      style={kpi.card}
    >
      <View style={[kpi.iconBox, { backgroundColor: colorLt }]}>
        <item.icon size={20} color={color} strokeWidth={2.5} />
      </View>
      <View>
        <Text style={kpi.label}>{item.label}</Text>
        <Text style={[kpi.value, { color }]}>
          {item.value}<Text style={kpi.unit}> {item.unit}</Text>
        </Text>
        <Text style={kpi.sub}>{item.sub}</Text>
      </View>
    </Animated.View>
  );
}

function AnimatedBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const heightVal = useSharedValue(0);

  React.useEffect(() => {
    heightVal.value = withDelay(delay, withTiming(pct, { duration: Anim.slow }));
  }, [pct, delay]);

  const style = useAnimatedStyle(() => ({
    height: `${heightVal.value}%`,
  }));

  return <Animated.View style={[s.barFill, style, { backgroundColor: color }]} />;
}

const kpi = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: Palette.surface,
    padding: Space.sp4,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Palette.divider,
    gap: Space.sp3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.r2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Font.displayMedium,
    fontSize: 10,
    color: Palette.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
  },
  unit: {
    fontSize: FontSize.xs,
    fontFamily: Font.displayMedium,
    color: Palette.inkMid,
  },
  sub: {
    fontFamily: Font.body,
    fontSize: 10,
    color: Palette.inkFaint,
    marginTop: 2,
  },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function Progress() {
  const { state, activeUser, setActiveUser } = useApp();
  const color = userColor(activeUser);
  const colorLt = userColorLt(activeUser);
  const weekData = WEEK_DATA[activeUser];
  const maxVal = Math.max(...weekData);

  return (
    <ScrollView 
      style={s.root} 
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <View>
          <Text style={s.title}>Insights</Text>
          <Text style={s.subtitle}>ข้อมูลสุขภาพของคุณและคู่รัก</Text>
        </View>

        <View style={s.toggle}>
          {(["me", "partner"] as const).map((u) => (
            <Pressable
              key={u}
              style={[
                s.toggleBtn,
                activeUser === u && {
                  backgroundColor: Palette.surface,
                  ...Shadow.sm,
                },
              ]}
              onPress={async () => {
                await Haptics.selectionAsync();
                setActiveUser(u);
              }}
            >
              <Text
                style={[
                  s.toggleText,
                  activeUser === u && { color, fontFamily: Font.displayBold },
                ]}
              >
                {state[u]?.name ?? (u === "me" ? "Me" : "Partner")}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.kpiGrid}>
        {KPI_LIST(activeUser, state).map((item, i) => (
          <KPICard key={item.label} item={item} color={color} colorLt={colorLt} delay={i * 60} />
        ))}
      </View>

      <Animated.View 
        entering={FadeInDown.delay(240).duration(Anim.slow)}
        style={s.chartSection}
      >
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>กิจกรรมสัปดาห์นี้</Text>
          <View style={s.chartLegend}>
            <View style={[s.legendDot, { backgroundColor: color }]} />
            <Text style={s.legendText}>คุณ</Text>
            <View style={[s.legendDot, { backgroundColor: activeUser === 'me' ? Palette.terra : Palette.moss, marginLeft: 12 }]} />
            <Text style={s.legendText}>แฟน</Text>
          </View>
        </View>

        <View style={s.chartContainer}>
          <View style={s.chartArea}>
            {weekData.map((v, i) => {
              const partnerV = WEEK_DATA[activeUser === 'me' ? 'partner' : 'me'][i];
              const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
              const pPct = maxVal > 0 ? (partnerV / maxVal) * 100 : 0;
              
              const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
              
              return (
                <Pressable 
                  key={i} 
                  style={s.barCol}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Could add state for showing specific day detail
                  }}
                >
                  <View style={s.barTrackContainer}>
                    <View style={s.barTrack}>
                      <AnimatedBar pct={pct} color={color} delay={i * 80 + 300} />
                    </View>
                    <View style={[s.barTrack, { width: 4, opacity: 0.5 }]}>
                      <AnimatedBar pct={pPct} color={activeUser === 'me' ? Palette.terra : Palette.moss} delay={i * 80 + 400} />
                    </View>
                  </View>
                  <Text style={[s.barLabel, isToday && { color, fontFamily: Font.displayBold }]}>
                    {DAY_LABELS[i]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          
          <View style={s.chartDivider} />
          
          <View style={s.comparisonBrief}>
            <Heart size={16} color={Palette.terra} fill={Palette.terra} />
            <Text style={s.comparisonText}>
              สัปดาห์นี้คุณออกกำลังกายมากกว่าแฟน <Text style={{ fontFamily: Font.displayBold }}>20%</Text>
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(300).duration(Anim.slow)}
        style={s.achSection}
      >
        <Text style={s.sectionTitle}>ความสำเร็จ</Text>
        <View style={s.achGrid}>
          {ACHIEVEMENTS.map((a, i) => (
            <View key={i} style={[s.achCard, !a.earned && { opacity: 0.4 }]}>
              <View style={[s.achIcon, { backgroundColor: a.earned ? colorLt : Palette.bg }]}>
                <a.icon size={24} color={a.earned ? color : Palette.inkFaint} strokeWidth={2} />
              </View>
              <Text style={s.achLabel}>{a.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  scroll: { paddingTop: 64, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Space.sp5,
    marginBottom: Space.sp6,
  },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.xl,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkFaint,
    marginTop: 2,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: Palette.divider,
    borderRadius: Radius.full,
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  toggleText: {
    fontFamily: Font.displayMedium,
    fontSize: 12,
    color: Palette.inkMid,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Space.sp5,
    gap: Space.sp3,
    marginBottom: Space.sp6,
  },
  chartSection: {
    paddingHorizontal: Space.sp5,
    marginBottom: Space.sp6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.sp4,
  },
  sectionTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.ink,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: Font.displayMedium,
    color: Palette.inkMid,
  },
  chartContainer: {
    backgroundColor: Palette.surface,
    padding: Space.sp5,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    marginBottom: Space.sp4,
  },
  barCol: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  barTrackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 80,
  },
  barTrack: {
    width: 8,
    height: '100%',
    backgroundColor: Palette.bg,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 10,
    color: Palette.inkFaint,
  },
  chartDivider: {
    height: 1,
    backgroundColor: Palette.divider,
    marginBottom: Space.sp4,
  },
  comparisonBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.bg,
    padding: 12,
    borderRadius: 12,
  },
  comparisonText: {
    fontFamily: Font.body,
    fontSize: 12,
    color: Palette.inkMid,
    flex: 1,
  },
  achSection: {
    paddingHorizontal: Space.sp5,
  },
  achGrid: {
    flexDirection: "row",
    gap: Space.sp3,
  },
  achCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  achIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.r3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  achLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 10,
    textAlign: "center",
    color: Palette.inkMid,
    lineHeight: 13,
  },
});
