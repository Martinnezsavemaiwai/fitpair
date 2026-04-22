/**
 * app/(tabs)/schedule.tsx — Weekly Training Schedule
 * 
 * Soft Modern Principles:
 * - Editorial rhythm via typography hierarchy
 * - Left-aligned content blocks
 * - Subtle status indicators (no heavy sidebars)
 * - Perceptually uniform colors via OKLCH tokens
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
import Animated, { FadeInDown } from "react-native-reanimated";
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
  userColorDim,
} from "@/constants/DS";
import { useApp } from "@/context/AppContext";
import { 
  Dumbbell, 
  Activity, 
  Flame, 
  Moon, 
  Scaling, 
  Footprints,
  Wind
} from "lucide-react-native";

const ICON_MAP = {
  strength: Dumbbell,
  cardio: Activity,
  hiit: Flame,
  rest: Moon,
  stretch: Wind,
  balance: Scaling,
  walk: Footprints,
};

// ─── DATA ─────────────────────────────────────────────────────────

const DAYS = [
  { key: "Mon", label: "จันทร์", short: "จ" },
  { key: "Tue", label: "อังคาร", short: "อ" },
  { key: "Wed", label: "พุธ", short: "พ" },
  { key: "Thu", label: "พฤหัสบดี", short: "พฤ" },
  { key: "Fri", label: "ศุกร์", short: "ศ" },
  { key: "Sat", label: "เสาร์", short: "ส" },
  { key: "Sun", label: "อาทิตย์", short: "อา" },
];

const SCHEDULE = {
  me: {
    Mon: { icon: "strength", title: "Strength + Core", sub: "วิดพื้น · สควอท · Leg Raise", type: "strength", dur: "45 นาที" },
    Tue: { icon: "cardio", title: "Zone 2 Cardio", sub: "เดินเร็ว / วิ่งเหยาะๆ คุม HR", type: "cardio", dur: "30 นาที" },
    Wed: { icon: "strength", title: "Strength + Core", sub: "เน้นหน้าท้องล่าง + Core Stability", type: "strength", dur: "45 นาที" },
    Thu: { icon: "cardio", title: "Zone 2 Cardio", sub: "วิ่งสลับเดิน 3:1 นาที", type: "cardio", dur: "30 นาที" },
    Fri: { icon: "strength", title: "Strength + Core", sub: "Full body bodyweight", type: "strength", dur: "45 นาที" },
    Sat: { icon: "hiit", title: "High Intensity", sub: "Compound movements ยิม/สวน", type: "hiit", dur: "60 นาที" },
    Sun: { icon: "rest", title: "Full Rest", sub: "ยืดเหยียด · โยคะ · พักผ่อน", type: "rest", dur: "-" },
  },
  partner: {
    Mon: { icon: "rest", title: "Rest & Recover", sub: "เน้นนอนพักผ่อน เก็บแรง", type: "rest", dur: "-" },
    Tue: { icon: "stretch", title: "Active Stretch", sub: "ยืดเหยียดเบาๆ 10 นาที", type: "stretch", dur: "10 นาที" },
    Wed: { icon: "rest", title: "Rest & Recover", sub: "พักผ่อนให้เต็มที่", type: "rest", dur: "-" },
    Thu: { icon: "stretch", title: "Active Stretch", sub: "ยืดเหยียดสลายความเมื่อย", type: "stretch", dur: "10 นาที" },
    Fri: { icon: "balance", title: "Core & Balance", sub: "Dead Bug · Glute Bridge", type: "strength", dur: "30 นาที" },
    Sat: { icon: "walk", title: "Active Walk", sub: "เดินเล่นรับแดดเช้า 30 นาที", type: "cardio", dur: "30 นาที" },
    Sun: { icon: "rest", title: "Full Rest", sub: "Cheat day + พักผ่อน", type: "rest", dur: "-" },
  },
} as const;

// ─── COMPONENTS ───────────────────────────────────────────────────

function DayRow({ 
  day, 
  data, 
  isToday, 
  color, 
  colorLt 
}: { 
  day: typeof DAYS[0]; 
  data: any; 
  isToday: boolean; 
  color: string; 
  colorLt: string;
}) {
  return (
    <View style={[row.root, isToday && { borderColor: color + "33", backgroundColor: Palette.surface }]}>
      <View style={row.dateBox}>
        <Text style={[row.dayName, isToday && { color }]}>{day.short}</Text>
        {isToday && <View style={[row.dot, { backgroundColor: color }]} />}
      </View>

      <View style={row.content}>
        <View style={row.titleRow}>
          <Text style={[row.title, isToday && { color }]}>{data.title}</Text>
          {data.dur !== "-" && (
            <View style={[row.badge, { backgroundColor: colorLt }]}>
              <Text style={[row.badgeText, { color }]}>{data.dur}</Text>
            </View>
          )}
        </View>
        <Text style={row.sub}>{data.sub}</Text>
      </View>
      
      <View style={[row.iconBox, { backgroundColor: isToday ? colorLt : Palette.bg }]}>
        {(() => {
          const Icon = ICON_MAP[data.icon as keyof typeof ICON_MAP];
          return Icon ? <Icon size={18} color={isToday ? color : Palette.inkMid} /> : null;
        })()}
      </View>
    </View>
  );
}

const row = StyleSheet.create({
  root: {
    flexDirection: "row",
    paddingVertical: Space.sp4,
    paddingHorizontal: Space.sp4,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
    alignItems: "center",
    gap: Space.sp4,
  },
  dateBox: {
    width: 32,
    alignItems: "center",
  },
  dayName: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
    color: Palette.inkFaint,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sp2,
    marginBottom: 2,
  },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.ink,
  },
  sub: {
    fontFamily: Font.body,
    fontSize: FontSize.xs,
    color: Palette.inkMid,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.r1,
  },
  badgeText: {
    fontFamily: Font.displayBold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.r2,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────

export default function Schedule() {
  const { state, activeUser, setActiveUser } = useApp();
  const color = userColor(activeUser);
  const colorLt = userColorLt(activeUser);
  const schedule = SCHEDULE[activeUser];

  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <ScrollView 
      style={s.root} 
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Weekly Plan</Text>
          <Text style={s.subtitle}>ความสม่ำเสมอคือหัวใจของความสำเร็จ</Text>
        </View>

        {/* User toggle */}
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

      {/* Summary card */}
      <Animated.View 
        entering={FadeInDown.duration(Anim.slow)}
        style={[s.summary, { backgroundColor: colorLt }]}
      >
        <Text style={[s.summaryLabel, { color }]}>Focus ประจำสัปดาห์</Text>
        <Text style={s.summaryText}>
          {activeUser === "me" 
            ? "เน้นการสร้างกล้ามเนื้อและควบคุมอัตราการเต้นของหัวใจในระดับ Zone 2"
            : "เน้นการยืดเหยียดสม่ำเสมอเพื่อลดความเมื่อยล้าจากการเรียน"}
        </Text>
      </Animated.View>

      {/* Schedule list */}
      <View style={s.list}>
        {DAYS.map((day, i) => (
          <Animated.View 
            key={day.key}
            entering={FadeInDown.delay(100 + i * 40).duration(Anim.normal)}
          >
            <DayRow 
              day={day} 
              data={schedule[day.key as keyof typeof schedule]} 
              isToday={i === todayIdx}
              color={color}
              colorLt={colorLt}
            />
          </Animated.View>
        ))}
      </View>
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
  summary: {
    marginHorizontal: Space.sp5,
    padding: Space.sp5,
    borderRadius: Radius.r3,
    marginBottom: Space.sp4,
  },
  summaryLabel: {
    fontFamily: Font.displayBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.ink,
    lineHeight: FontSize.sm * 1.5,
  },
  list: {
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.divider,
  },
});
