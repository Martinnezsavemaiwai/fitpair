import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  FadeInDown,
  useAnimatedScrollHandler,
  interpolateColor,
  SharedValue,
  useAnimatedRef,
  scrollTo,
} from "react-native-reanimated";
import { Palette, Space, Radius, Font, Shadow } from "@/constants/DS";
import { ShieldCheck, Heart, Zap, ArrowRight, Sparkles, Orbit } from "lucide-react-native";

const { width: W, height: H } = Dimensions.get("window");

// ─── SLIDE DATA ───────────────────────────────────────────────────

const SLIDES = [
  {
    num: "01",
    headline: "ออกแบบ\nร่างกายคุณ",
    body: "แผนออกกำลังกายที่วางตามสภาพร่างกาย เป้าหมาย และไลฟ์สไตล์จริงๆ ของคุณ — ไม่ใช่แผนสำเร็จรูป",
    accent: Palette.moss,
    accentLt: Palette.mossLt,
    accentDim: Palette.mossDim,
    Icon: Zap,
    description: "Personalized Training",
  },
  {
    num: "02",
    headline: "ดูแลกัน\nด้วยกัน",
    body: "เห็น progress ของกันและกัน กระตุ้น ร่วมฉลอง และเดินหน้าไปพร้อมกันในแบบที่เหมาะกับทั้งคู่",
    accent: Palette.terra,
    accentLt: Palette.terraLt,
    accentDim: Palette.terraDim,
    Icon: Heart,
    description: "Shared Progress",
  },
  {
    num: "03",
    headline: "ปลอดภัย\nทุกขั้นตอน",
    body: "รู้จักภาวะสุขภาพของคุณ ตั้งแต่โลหิตจางถึงปัญหาข้อเข่า แผนจะปรับให้เหมาะกับร่างกายคุณเอง",
    accent: Palette.info,
    accentLt: Palette.infoLt,
    accentDim: Palette.infoLt,
    Icon: ShieldCheck,
    description: "Health-First Safety",
  },
] as const;

// ─── ADVANCED VISUAL COMPONENT ───────────────────────────────────

function SlideVisual({ index, accent, scrollX }: { index: number; accent: string; scrollX: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      scrollX.value,
      [(index - 1) * W, index * W, (index + 1) * W],
      [-30, 0, 30],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollX.value,
      [(index - 0.5) * W, index * W, (index + 0.5) * W],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      [(index - 1) * W, index * W, (index + 1) * W],
      [20, 0, 20],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate / 2}deg` },
        { rotateZ: `${rotate}deg` },
        { scale },
        { translateY }
      ],
    };
  });

  const Icon = SLIDES[index].Icon;

  return (
    <Animated.View style={[vis.container, animatedStyle]}>
      {/* Background Orbs */}
      <View style={[vis.orb, vis.orb1, { backgroundColor: accent + '15' }]} />
      <View style={[vis.orb, vis.orb2, { backgroundColor: accent + '10' }]} />
      
      {/* Central Glass Card */}
      <View style={[vis.glassCard, { borderColor: accent + '30' }]}>
        <View style={[vis.iconCircle, { backgroundColor: accent + '10' }]}>
          <Icon size={56} color={accent} strokeWidth={1.5} fill={index === 1 ? accent + '20' : 'transparent'} />
        </View>
        <View style={vis.decoration}>
           <Orbit size={20} color={accent} style={{ opacity: 0.3 }} />
        </View>
      </View>
    </Animated.View>
  );
}

const vis = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
  },
  orb1: {
    width: 200,
    height: 200,
    top: 0,
    left: 0,
  },
  orb2: {
    width: 160,
    height: 160,
    bottom: 10,
    right: 10,
  },
  glassCard: {
    width: 180,
    height: 180,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decoration: {
    position: 'absolute',
    top: 15,
    right: 15,
  }
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setSlideIndex(idx);
  };

  const goNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (slideIndex < SLIDES.length - 1) {
      const nextIndex = slideIndex + 1;
      setSlideIndex(nextIndex);
      // Use standard scrollTo which is more reliable on Web for ScrollView
      scrollRef.current?.scrollTo({ x: nextIndex * W, animated: true });
    } else {
      router.push("/profile-setup");
    }
  }, [slideIndex]);

  const goSkip = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/profile-setup");
  }, []);

  const bgAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      SLIDES.map((_, i) => i * W),
      SLIDES.map(s => s.accentDim)
    );
    return { backgroundColor };
  });

  const btnAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      SLIDES.map((_, i) => i * W),
      SLIDES.map(s => s.accent)
    );
    return { backgroundColor };
  });

  return (
    <Animated.View style={[s.root, bgAnimatedStyle]}>
      {/* Decorative BG Elements */}
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
         <Sparkles size={24} color="rgba(0,0,0,0.03)" style={{ position: 'absolute', top: H * 0.1, left: W * 0.1 }} />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      >
        {SLIDES.map((sl, i) => (
          <View key={i} style={[s.slide, { width: W }]}>
            <View style={s.topContent}>
              <Animated.View entering={FadeInDown.delay(200)}>
                <View style={[s.tag, { backgroundColor: sl.accent + '20' }]}>
                  <Text style={[s.tagText, { color: sl.accent }]}>{sl.description.toUpperCase()}</Text>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(350)}>
                <Text style={s.headline}>{sl.headline}</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(500)}>
                <Text style={s.body}>{sl.body}</Text>
              </Animated.View>
            </View>

            <View style={s.visualWrapper}>
              <SlideVisual index={i} accent={sl.accent} scrollX={scrollX} />
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerTopRow}>
          <View style={s.indicatorRow}>
            {SLIDES.map((_, i) => {
              const dotStyle = useAnimatedStyle(() => {
                const width = interpolate(
                  scrollX.value,
                  [(i - 1) * W, i * W, (i + 1) * W],
                  [8, 24, 8],
                  Extrapolation.CLAMP
                );
                const opacity = interpolate(
                  scrollX.value,
                  [(i - 1) * W, i * W, (i + 1) * W],
                  [0.3, 1, 0.3],
                  Extrapolation.CLAMP
                );
                const color = interpolateColor(
                  scrollX.value,
                  SLIDES.map((_, idx) => idx * W),
                  SLIDES.map(s => s.accent)
                );
                return { width, opacity, backgroundColor: color };
              });
              return <Animated.View key={i} style={[s.dot, dotStyle]} />;
            })}
          </View>

          {slideIndex < SLIDES.length - 1 && (
            <Pressable style={s.skipBtn} onPress={goSkip}>
              <Text style={s.skipBtnText}>ข้ามบทนำ</Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={goNext}>
          <Animated.View style={[s.mainBtn, btnAnimatedStyle]}>
            <Text style={s.mainBtnText}>
              {slideIndex === SLIDES.length - 1 ? "เริ่มต้นใช้งาน" : "ถัดไป"}
            </Text>
            <ArrowRight size={22} color="white" />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: Space.sp6,
    justifyContent: 'space-between',
    paddingTop: H * 0.12,
    paddingBottom: H * 0.25,
  },
  topContent: {
    flex: 0,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.r2,
    marginBottom: Space.sp4,
  },
  tagText: {
    fontFamily: Font.displayBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  headline: {
    fontFamily: Font.displayBold,
    fontSize: 44,
    color: Palette.ink,
    lineHeight: 48,
    letterSpacing: -1.5,
    marginBottom: Space.sp4,
  },
  body: {
    fontFamily: Font.body,
    fontSize: 17,
    color: Palette.inkMid,
    lineHeight: 26,
    maxWidth: '90%',
  },
  visualWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Space.sp6,
    paddingBottom: 50,
  },
  footerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  skipBtn: {
    padding: 4,
  },
  skipBtnText: {
    fontFamily: Font.displayMedium,
    fontSize: 15,
    color: Palette.inkMid,
    opacity: 0.6,
  },
  mainBtn: {
    height: 68,
    borderRadius: Radius.r4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Shadow.md,
  },
  mainBtnText: {
    fontFamily: Font.displayBold,
    fontSize: 19,
    color: 'white',
  },
});