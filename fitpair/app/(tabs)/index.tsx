import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Animated, {
  FadeInUp,
} from "react-native-reanimated";
import { Palette, Space, FontSize, Radius, Font, Shadow, userColor, userColorLt } from "@/constants/DS";
import { useApp } from "@/context/AppContext";
import { Heart, Check, Droplets, Minus, Plus, User, LogOut, Sparkles, Zap, Trophy, ArrowRight } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ─── STREAK CALENDAR ──────────────────────────────────────────────

const DAY_LABELS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const MOCK_STREAK = [true, true, true, false, true, true, false];

function StreakCalendar({ color }: { color: string }) {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <View style={s.streakRow}>
      {DAY_LABELS.map((label, i) => {
        const active = MOCK_STREAK[i];
        const isToday = i === todayIdx;
        return (
          <View key={label} style={s.streakDay}>
            <View
              style={[
                s.streakDot,
                active && { backgroundColor: color, ...Shadow.sm },
                isToday && !active && { borderColor: color, borderWidth: 2 },
              ]}
            >
              {active && <Check size={12} color="white" strokeWidth={4} />}
            </View>
            <Text style={[s.streakLabel, isToday && { color, fontFamily: Font.displayBold }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────

export default function Dashboard() {
  const { state, activeUser, activeChecks, addWater, signOut } = useApp();
  const router = useRouter();

  const col = userColor(activeUser);

  return (
    <View style={s.container}>
      <LinearGradient
        colors={[Palette.bg, Palette.divider + '20', Palette.bg]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={s.root}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>สวัสดี, {state[activeUser]?.name ?? "Partner"}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.title}>วันนี้มาลุยกันต่อ</Text>
              <Sparkles size={18} color={Palette.caution} fill={Palette.caution} />
            </View>
          </View>
          <View style={s.headerActions}>
            <Pressable
              style={s.iconCircle}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await signOut();
                router.replace("/login");
              }}
            >
              <LogOut size={18} color={Palette.inkMid} />
            </Pressable>
            <Pressable
              style={[s.profileCircle, { borderColor: col + '40' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/edit-profile");
              }}
            >
              {(() => {
                const avatar = state[activeUser]?.avatar || "User";
                const isUri = avatar.startsWith('file://') || avatar.startsWith('http') || avatar.startsWith('content://');
                if (isUri) return <Image source={{ uri: avatar }} style={s.avatarImg} />;
                const AvatarIcon = (LucideIcons as any)[avatar] || User;
                return <AvatarIcon size={22} color={col} strokeWidth={2.5} />;
              })()}
            </Pressable>
          </View>
        </View>

        <StreakCalendar color={col} />

        {/* Highlight Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={s.mainCardWrapper}>
          <Pressable
            style={({ pressed }) => [
              s.mainCard,
              { backgroundColor: Palette.surface },
              pressed && { scale: 0.98 }
            ]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.push("/workout");
            }}
          >
            <LinearGradient
              colors={[col + '10', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={s.mainCardHeader}>
              <View style={[s.badge, { backgroundColor: col + '20' }]}>
                <Zap size={10} color={col} fill={col} />
                <Text style={[s.badgeText, { color: col }]}>NEXT UP</Text>
              </View>
              <Trophy size={16} color={Palette.caution} />
            </View>
            <Text style={s.mainCardTitle}>Strength + Core</Text>
            <Text style={s.mainCardMeta}>45 นาที · ระดับกลาง · เผาผลาญ ~320 kcal</Text>
            
            <View style={s.mainCardFooter}>
               <View style={s.avatarStack}>
                  <View style={[s.miniAvatar, { backgroundColor: Palette.mossLt }]} />
                  <View style={[s.miniAvatar, { backgroundColor: Palette.terraLt, marginLeft: -8 }]} />
               </View>
               <View style={[s.startBtn, { backgroundColor: col }]}>
                  <Text style={s.startBtnText}>เริ่มเลย</Text>
                  <ArrowRight size={14} color="white" />
               </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>KCAL</Text>
            <Text style={s.statVal}>1,840</Text>
            <View style={[s.statProgress, { backgroundColor: Palette.divider }]}>
              <View style={[s.statProgressFill, { width: '70%', backgroundColor: Palette.caution }]} />
            </View>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>STEPS</Text>
            <Text style={s.statVal}>8,420</Text>
            <View style={[s.statProgress, { backgroundColor: Palette.divider }]}>
              <View style={[s.statProgressFill, { width: '85%', backgroundColor: Palette.info }]} />
            </View>
          </View>
        </View>

        {/* Water Tracker */}
        <Animated.View entering={FadeInUp.delay(300)} style={s.waterCard}>
          <View style={s.waterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.waterIconBox, { backgroundColor: Palette.infoLt }]}>
                <Droplets size={18} color={Palette.info} />
              </View>
              <View>
                <Text style={s.waterTitle}>ดื่มน้ำวันนี้</Text>
                <Text style={s.waterSub}>{activeChecks.water}/8 แก้ว</Text>
              </View>
            </View>
            <View style={s.waterActions}>
              <Pressable onPress={() => addWater(-1)} style={s.waterMiniBtn}>
                <Minus size={14} color={Palette.inkMid} />
              </Pressable>
              <Pressable onPress={() => addWater(1)} style={[s.waterMiniBtn, { backgroundColor: Palette.info }]}>
                <Plus size={14} color="white" />
              </Pressable>
            </View>
          </View>
          <View style={s.waterGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View 
                key={i} 
                style={[s.waterDrop, i < activeChecks.water && { backgroundColor: Palette.info, borderColor: Palette.info }]} 
              />
            ))}
          </View>
        </Animated.View>

        {/* Couple Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={s.coupleSection}>
          <Text style={s.sectionTitle}>สถานะคู่ของคุณ</Text>
          <Pressable
            style={({ pressed }) => [s.coupleCard, pressed && { opacity: 0.85 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/couple-link');
            }}
          >
            <View style={s.coupleHeader}>
               <View style={s.coupleAvatars}>
                  <View style={[s.coupleAvatarBox, { backgroundColor: Palette.mossLt }]}>
                    <User size={20} color={Palette.moss} />
                  </View>
                  <View style={[s.coupleAvatarBox, { backgroundColor: Palette.terraLt, marginLeft: -12 }]}>
                    <Heart size={18} color={Palette.terra} fill={Palette.terra} />
                  </View>
               </View>
               <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.coupleTitle}>
                    {state.coupleConnected ? `เชื่อมต่อกับ ${state.partner.name}` : 'ยังไม่ได้เชื่อมต่อ'}
                  </Text>
                  <Text style={s.coupleSub}>
                    {state.coupleConnected ? 'คุณทั้งคู่กำลังทำได้ดีมาก!' : 'แตะเพื่อเชิญแฟนมาร่วม FitPair'}
                  </Text>
               </View>
               <ArrowRight size={18} color={Palette.inkFaint} />
            </View>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  root: { flex: 1 },
  scroll: { paddingBottom: 120, paddingTop: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Space.sp6,
    marginBottom: Space.sp6,
  },
  greeting: {
    fontFamily: Font.bodyMedium,
    fontSize: FontSize.sm,
    color: Palette.inkFaint,
    marginBottom: 2,
  },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.xl,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
    ...Shadow.sm,
    borderWidth: 1.5,
  },
  avatarImg: { width: '100%', height: '100%' },

  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Space.sp6,
    marginBottom: Space.sp7,
  },
  streakDay: { alignItems: "center", gap: 8 },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.divider + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  streakLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 11,
    color: Palette.inkFaint,
  },

  mainCardWrapper: {
    paddingHorizontal: Space.sp6,
    marginBottom: Space.sp6,
  },
  mainCard: {
    borderRadius: Radius.r5,
    padding: 24,
    ...Shadow.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: Font.displayBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainCardTitle: {
    fontFamily: Font.displayBold,
    fontSize: 24,
    color: Palette.ink,
    marginBottom: 6,
  },
  mainCardMeta: {
    fontFamily: Font.body,
    fontSize: 13,
    color: Palette.inkMid,
    marginBottom: 24,
  },
  mainCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.r3,
    ...Shadow.sm,
  },
  startBtnText: {
    fontFamily: Font.displayBold,
    fontSize: 14,
    color: 'white',
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Space.sp6,
    gap: 16,
    marginBottom: Space.sp6,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.r4,
    padding: 16,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  statLabel: {
    fontFamily: Font.displayBold,
    fontSize: 10,
    color: Palette.inkFaint,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statVal: {
    fontFamily: Font.displayBold,
    fontSize: 18,
    color: Palette.ink,
    marginBottom: 10,
  },
  statProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  waterCard: {
    marginHorizontal: Space.sp6,
    backgroundColor: Palette.surface,
    padding: 20,
    borderRadius: Radius.r5,
    marginBottom: Space.sp7,
    borderWidth: 1,
    borderColor: Palette.divider,
    ...Shadow.sm,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  waterIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: {
    fontFamily: Font.displayBold,
    fontSize: 15,
    color: Palette.ink,
  },
  waterSub: {
    fontFamily: Font.body,
    fontSize: 12,
    color: Palette.inkFaint,
  },
  waterActions: { flexDirection: 'row', gap: 10 },
  waterMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  waterGrid: { flexDirection: 'row', gap: 6 },
  waterDrop: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.divider + '30',
  },

  coupleSection: {
    paddingHorizontal: Space.sp6,
  },
  sectionTitle: {
    fontFamily: Font.displayBold,
    fontSize: 16,
    color: Palette.ink,
    marginBottom: 16,
  },
  coupleCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.r5,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.divider,
    ...Shadow.sm,
  },
  coupleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coupleAvatars: {
    flexDirection: 'row',
  },
  coupleAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.surface,
  },
  coupleTitle: {
    fontFamily: Font.displayBold,
    fontSize: 15,
    color: Palette.ink,
  },
  coupleSub: {
    fontFamily: Font.body,
    fontSize: 12,
    color: Palette.inkMid,
  },
  nudgeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.divider,
  }
});