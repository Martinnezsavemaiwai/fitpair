import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Space, Radius, Font, FontSize, Shadow } from '@/constants/DS';
import { useApp } from '@/context/AppContext';
import {
  Heart, Copy, Check, ArrowLeft, Link2, Sparkles,
  ChevronRight, Loader, AlertCircle, UserCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CoupleLinkScreen() {
  const router = useRouter();
  const { myInviteCode, connectCouple, state } = useApp();
  const [partnerCode, setPartnerCode] = useState('FP-');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleCopy = async () => {
    try {
      await Share.share({
        message: `มาออกกำลังกายด้วยกันบน FitPair! ใส่โค้ดนี้เพื่อเชื่อมต่อกับฉัน: ${myInviteCode}`,
        title: 'FitPair Invite Code',
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // User cancelled share sheet — no-op
    }
  };

  const handleConnect = async () => {
    if (partnerCode.trim().toUpperCase() === myInviteCode) {
      setError('ไม่สามารถเชื่อมต่อกับตัวเองได้นะครับ 😄');
      return;
    }

    setLoading(true);
    setError(null);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error: linkErr } = await connectCouple(partnerCode);

    if (linkErr) {
      setError(linkErr);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.back(), 2000);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <LinearGradient
        colors={[Palette.terraLt + '40', Palette.bg, Palette.bg]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={s.root}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0)} style={s.header}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Palette.ink} />
          </Pressable>
          <Text style={s.headerTitle}>เชื่อมต่อคู่รัก</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100)} style={s.heroSection}>
          <View style={s.heroIconWrapper}>
            <LinearGradient
              colors={[Palette.terraLt, Palette.mossLt]}
              style={s.heroIconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={s.heroIconCircle}>
              <Heart size={40} color={Palette.terra} fill={Palette.terra + '40'} />
            </View>
            <View style={s.heroIconBadge}>
              <Link2 size={14} color="white" />
            </View>
          </View>
          <Text style={s.heroTitle}>เริ่มต้นการเดินทางด้วยกัน</Text>
          <Text style={s.heroSub}>
            แชร์โค้ดของคุณให้แฟน หรือใส่โค้ดของแฟนเพื่อเชื่อมต่อและเห็น progress ของกันและกันครับ
          </Text>
        </Animated.View>

        {/* My Invite Code Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={s.card}>
          <View style={s.cardHeader}>
            <Sparkles size={16} color={Palette.caution} />
            <Text style={s.cardLabel}>โค้ดเชิญของคุณ</Text>
          </View>
          <View style={s.codeRow}>
            <Text style={s.codeText}>{myInviteCode}</Text>
            <Pressable
              style={[s.copyBtn, copied && { backgroundColor: Palette.mossLt }]}
              onPress={handleCopy}
            >
              {copied ? (
                <Check size={18} color={Palette.moss} />
              ) : (
                <Copy size={18} color={Palette.terra} />
              )}
              <Text style={[s.copyBtnText, { color: copied ? Palette.moss : Palette.terra }]}>
                {copied ? 'แชร์แล้ว!' : 'แชร์โค้ด'}
              </Text>
            </Pressable>
          </View>
          <Text style={s.codeHint}>ส่งโค้ดนี้ให้แฟนของคุณเพื่อให้พวกเขาใส่ในช่องด้านล่างครับ</Text>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={FadeInUp.delay(300)} style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>หรือใส่โค้ดของแฟน</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* Enter Partner Code */}
        <Animated.View entering={FadeInUp.delay(400)} style={s.card}>
          <View style={s.cardHeader}>
            <Link2 size={16} color={Palette.info} />
            <Text style={s.cardLabel}>โค้ดเชิญของแฟน</Text>
          </View>

          {success ? (
            <View style={s.successBox}>
              <UserCheck size={32} color={Palette.moss} />
              <Text style={s.successTitle}>เชื่อมต่อสำเร็จ!</Text>
              <Text style={s.successSub}>คุณและแฟนเชื่อมต่อกันแล้ว ✨</Text>
            </View>
          ) : (
            <>
              <Pressable
                style={[s.inputWrapper, error && { borderColor: Palette.danger }]}
                onPress={() => inputRef.current?.focus()}
              >
                <TextInput
                  ref={inputRef}
                  style={s.input}
                  value={partnerCode}
                  onChangeText={(t) => {
                    setError(null);
                    // Auto-prefix FP-
                    if (!t.toUpperCase().startsWith('FP-')) {
                      setPartnerCode('FP-');
                    } else {
                      setPartnerCode(t.toUpperCase());
                    }
                  }}
                  placeholder="FP-XXXXXX"
                  placeholderTextColor={Palette.inkFaint}
                  autoCapitalize="characters"
                  maxLength={9}
                />
              </Pressable>

              {error && (
                <Animated.View entering={FadeInDown} style={s.errorRow}>
                  <AlertCircle size={14} color={Palette.danger} />
                  <Text style={s.errorText}>{error}</Text>
                </Animated.View>
              )}

              <Pressable
                style={({ pressed }) => [s.connectBtn, pressed && { opacity: 0.85 }]}
                onPress={handleConnect}
                disabled={loading || partnerCode.length < 9}
              >
                <LinearGradient
                  colors={[Palette.terra, Palette.moss]}
                  style={s.connectBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Loader size={22} color="white" />
                  ) : (
                    <>
                      <Heart size={18} color="white" fill="white" />
                      <Text style={s.connectBtnText}>เชื่อมต่อเลย</Text>
                      <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </>
          )}
        </Animated.View>

        {/* Already connected note */}
        {state.coupleConnected && !success && (
          <Animated.View entering={FadeInUp.delay(500)} style={s.alreadyNote}>
            <UserCheck size={16} color={Palette.moss} />
            <Text style={s.alreadyText}>คุณเชื่อมต่อกับ {state.partner.name} อยู่แล้วครับ</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.bg },
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: Space.sp6,
    paddingBottom: 60,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.divider,
    ...Shadow.sm,
  },
  headerTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.ink,
  },

  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroIconWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  heroIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.3,
    position: 'absolute',
  },
  heroIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.terraLt,
    ...Shadow.md,
  },
  heroIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.terra,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.bg,
  },
  heroTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
    color: Palette.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSub: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkMid,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width - 80,
  },

  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.r5,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.divider,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: Font.displayBold,
    fontSize: 12,
    color: Palette.inkMid,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.bg,
    borderRadius: Radius.r3,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  codeText: {
    fontFamily: Font.displayBold,
    fontSize: 28,
    color: Palette.ink,
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.terraLt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.r3,
  },
  copyBtnText: {
    fontFamily: Font.displayBold,
    fontSize: 13,
  },
  codeHint: {
    fontFamily: Font.body,
    fontSize: 12,
    color: Palette.inkFaint,
    lineHeight: 18,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.divider,
  },
  dividerText: {
    fontFamily: Font.bodyMedium,
    fontSize: 12,
    color: Palette.inkFaint,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderRadius: Radius.r3,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: Palette.divider,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontFamily: Font.displayBold,
    fontSize: 24,
    color: Palette.ink,
    letterSpacing: 2,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: Font.bodyMedium,
    fontSize: 13,
    color: Palette.danger,
    flex: 1,
  },

  connectBtn: {
    borderRadius: Radius.r4,
    overflow: 'hidden',
    ...Shadow.md,
  },
  connectBtnGradient: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  connectBtnText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: 'white',
  },

  successBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  successTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
    color: Palette.moss,
  },
  successSub: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkMid,
  },

  alreadyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.mossLt,
    padding: 14,
    borderRadius: Radius.r3,
    marginBottom: 16,
  },
  alreadyText: {
    fontFamily: Font.bodyMedium,
    fontSize: 13,
    color: Palette.moss,
  },
});
