import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
  FadeIn,
  SlideInRight,
} from "react-native-reanimated";
import {
  Palette, Space, FontSize, Radius, Font, Shadow, Anim,
  bmi, bmiLabel,
} from "@/constants/DS";
import { useApp } from "@/context/AppContext";
import type { Gender, GoalId, HealthFlag } from "@/context/AppContext";
import { 
  Droplets, 
  HeartPulse, 
  Footprints, 
  Bone, 
  Syringe, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  User,
  Flower2,
  Dumbbell,
  Smile,
  Heart,
  Sparkles,
  ChevronRight
} from "lucide-react-native";

// ─── STEP DATA ────────────────────────────────────────────────────

const GOALS: { id: GoalId; label: string; sub: string }[] = [
  { id: "sixpack",  label: "Six-pack & ความอึด",    sub: "ลดไขมัน + สร้างกล้ามเนื้อ" },
  { id: "lean",     label: "Lean & กล้ามเนื้อสวย",  sub: "ปรับสรีระให้ดูดี" },
  { id: "health",   label: "สุขภาพดีทั่วไป",         sub: "ออกกำลังกายสม่ำเสมอ" },
  { id: "gain",     label: "เพิ่มมวล / น้ำหนัก",    sub: "สร้างกล้ามเนื้อและแรง" },
  { id: "eleven",   label: "ร่อง 11 & สรีระดี",      sub: "เน้นหน้าท้องและบุคลิก" },
  { id: "endurance",label: "ความอึด & Cardio",        sub: "เพิ่มความทนทานหัวใจ" },
];

const HEALTH_FLAGS: { id: HealthFlag; label: string; sub: string; icon: any }[] = [
  { id: "anemia",   label: "โลหิตจาง",          sub: "Anemia",          icon: Droplets },
  { id: "heart",    label: "โรคหัวใจ",           sub: "Cardiovascular",  icon: HeartPulse },
  { id: "knee",     label: "ปัญหาข้อเข่า",       sub: "Knee issues",     icon: Footprints },
  { id: "back",     label: "ปัญหาหลัง",          sub: "Back pain",       icon: Bone },
  { id: "diabetes", label: "เบาหวาน",             sub: "Diabetes",        icon: Syringe },
  { id: "none",     label: "ไม่มีโรคประจำตัว",   sub: "สุขภาพแข็งแรงดี",   icon: Check },
];

const TOTAL_STEPS = 4;

// ─── COMPONENT ────────────────────────────────────────────────────

export default function ProfileSetup() {
  const router = useRouter();
  const { setMe, setOnboarded } = useApp();

  const [step, setStep] = useState(0);

  // Local form state
  const [name, setName]       = useState("");
  const [weight, setWeight]   = useState("");
  const [height, setHeight]   = useState("");
  const [gender, setGender]   = useState<Gender | null>(null);
  const [goal, setGoal]       = useState<GoalId>("health");
  const [healthFlags, setHealthFlags] = useState<HealthFlag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bmiVal = bmi(parseFloat(weight) || 0, parseFloat(height) || 1);
  const bmiStr = isNaN(bmiVal) ? "–" : bmiVal.toFixed(1);

  const toggleFlag = useCallback((id: HealthFlag) => {
    setHealthFlags((prev) => {
      if (id === "none") return prev.includes("none") ? [] : ["none"];
      const without = prev.filter((f) => f !== "none");
      return without.includes(id)
        ? without.filter((f) => f !== id)
        : [...without, id];
    });
  }, []);
  const clampValue = (val: string, min: number, max: number) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "";
    if (n < min) return min.toString();
    if (n > max) return max.toString();
    return n.toString();
  };

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/onboarding");
      }
    }
  }, [step, router]);

  const goNext = useCallback(async () => {
    if (step === 0) {
        const newErrors: Record<string, string> = {};
        
        if (!name.trim()) newErrors.name = "กรุณาระบุชื่อเล่น";
        else if (name.length < 2) newErrors.name = "ชื่อสั้นเกินไป";
        
        const w = parseFloat(weight);
        if (!weight) newErrors.weight = "ระบุน้ำหนัก";
        else if (isNaN(w) || w < 30 || w > 200) newErrors.weight = "30-200 กก.";

        const h = parseFloat(height);
        if (!height) newErrors.height = "ระบุส่วนสูง";
        else if (isNaN(h) || h < 100 || h > 230) newErrors.height = "100-230 ซม.";

        if (!gender) newErrors.gender = "กรุณาเลือกเพศ";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }
        setErrors({});
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setMe({
        name: name.trim() || "Partner",
        weight: parseFloat(weight) || 60,
        height: parseFloat(height) || 170,
        gender: gender || "other",
        goal,
        healthFlags,
        avatar: gender === "female" ? "Flower" : gender === "male" ? "Dumbbell" : "User",
      });
      setOnboarded();
      router.replace("/(tabs)");
    }
  }, [step, name, weight, height, gender, goal, healthFlags, setMe, setOnboarded]);



  return (
    <View style={s.root}>
      {/* Header with Back & Progress */}
      <View style={s.header}>
         <Pressable style={s.backBtn} onPress={goBack}>
           <ArrowLeft size={22} color={Palette.ink} />
         </Pressable>
         <View style={s.progressContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View key={i} style={s.progressSlot}>
                <Animated.View 
                  style={[
                    s.progressFill, 
                    { 
                      width: i <= step ? '100%' : '0%',
                      backgroundColor: i <= step ? Palette.moss : Palette.divider
                    }
                  ]} 
                />
              </View>
            ))}
         </View>
         {/* balance */}<View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={s.scroll} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* STEP 0: Basics */}
          {step === 0 && (
            <Animated.View entering={SlideInRight} style={s.stepContent}>
              <View style={s.titleRow}>
                <Text style={s.headline}>แนะนำตัวกันหน่อย</Text>
                <Sparkles size={24} color={Palette.caution} fill={Palette.caution} />
              </View>
              <Text style={s.subhead}>เราจะใช้ข้อมูลนี้เพื่อคำนวณ BMI และแผนออกกำลังกายที่เหมาะสมกับคุณที่สุด</Text>

              <Field 
                label="ชื่อของคุณ" 
                value={name} 
                onChangeText={(t: string) => { setName(t); if(errors.name) setErrors({...errors, name: ''}); }} 
                placeholder="ระบุชื่อเล่น" 
                error={errors.name}
                maxLength={20}
              />
              
              <View style={s.row}><View style={{ flex: 1 }}><Field 
                label="น้ำหนัก (กก.)" 
                value={weight} 
                onChangeText={(t: string) => { const filtered = t.replace(/[^0-9.]/g, ''); setWeight(filtered); if(errors.weight) setErrors({...errors, weight: filtered ? '' : errors.weight}); }} 
                onBlur={() => { if(weight) setWeight(clampValue(weight, 30, 200)); }}
                placeholder="0" 
                keyboardType="decimal-pad" 
                error={errors.weight}
                maxLength={5}
              /></View><View style={{ flex: 1 }}><Field 
                label="ส่วนสูง (ซม.)" 
                value={height} 
                onChangeText={(t: string) => { const filtered = t.replace(/[^0-9.]/g, ''); setHeight(filtered); if(errors.height) setErrors({...errors, height: filtered ? '' : errors.height}); }} 
                onBlur={() => { if(height) setHeight(clampValue(height, 100, 230)); }}
                placeholder="0" 
                keyboardType="decimal-pad" 
                error={errors.height}
                maxLength={5}
              /></View></View>
              <View style={s.labelRow}><Text style={s.fieldLabel}>เพศสภาพ</Text>{errors.gender ? <Text style={s.errorLabel}>{errors.gender}</Text> : null}</View>
              <View style={s.genderRow}>
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <Pressable 
                    key={g} 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGender(g);
                        if(errors.gender) setErrors({...errors, gender: ''});
                    }}
                    style={[
                        s.genderCard, 
                        gender === g && s.genderCardActive,
                        errors.gender && !gender && { borderColor: Palette.danger + '40' }
                    ]}
                  >
                    <Text style={[s.genderText, gender === g && s.genderTextActive]}>
                      {g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {parseFloat(weight) > 0 && parseFloat(height) > 0 && (
                <Animated.View entering={FadeIn} style={s.bmiCard}>
                    <View>
                        <Text style={s.bmiTitle}>ดัชนีมวลกาย (BMI)</Text>
                        <Text style={s.bmiStatus}>{bmiLabel(bmiVal)}</Text>
                    </View>
                    <Text style={s.bmiValue}>{bmiStr}</Text>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {/* STEP 1: Goals */}
          {step === 1 && (
            <Animated.View entering={SlideInRight} style={s.stepContent}>
              <Text style={s.headline}>เป้าหมายของคุณ</Text>
              <Text style={s.subhead}>เราจะเน้นท่าออกกำลังกายที่ช่วยให้คุณบรรลุเป้าหมายนี้ได้เร็วขึ้น</Text>

              {GOALS.map((g) => (
                <Pressable 
                  key={g.id} 
                  onPress={() => {
                    Haptics.selectionAsync();
                    setGoal(g.id);
                  }}
                  style={[s.goalCard, goal === g.id && s.goalCardActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.goalTitle, goal === g.id && s.goalTitleActive]}>{g.label}</Text>
                    <Text style={s.goalSub}>{g.sub}</Text>
                  </View>
                  <View style={[s.radio, goal === g.id && s.radioActive]}>
                    {goal === g.id && <Check size={14} color="white" strokeWidth={3} />}
                  </View>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* STEP 2: Health */}
          {step === 2 && (
            <Animated.View entering={SlideInRight} style={s.stepContent}>
              <Text style={s.headline}>ภาวะสุขภาพ</Text>
              <Text style={s.subhead}>ระบุเพื่อให้แผนออกกำลังกายปลอดภัยและไม่ฝืนร่างกายจนเกินไป</Text>

              <View style={s.healthGrid}>
                {HEALTH_FLAGS.map((f) => {
                  const active = healthFlags.includes(f.id);
                  return (
                    <Pressable 
                      key={f.id} 
                      onPress={() => {
                        Haptics.selectionAsync();
                        toggleFlag(f.id);
                      }}
                      style={[s.healthCard, active && s.healthCardActive]}
                    >
                      <f.icon size={24} color={active ? Palette.moss : Palette.inkMid} />
                      <Text style={[s.healthTitle, active && s.healthTitleActive]}>{f.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {healthFlags.includes('anemia') && (
                <Animated.View entering={FadeIn} style={s.anemiaAlert}>
                   <Droplets size={20} color={Palette.danger} />
                   <Text style={s.anemiaText}>เราจะระวังท่าที่ก้มและลุกเร็วๆ เพื่อป้องกันอาการหน้ามืดครับ</Text>
                </Animated.View>
              )}
            </Animated.View>
          )}

          {/* STEP 3: Connect */}
          {step === 3 && (
            <Animated.View entering={SlideInRight} style={s.stepContent}>
              <Text style={s.headline}>เชื่อมต่อคู่รัก</Text>
              <Text style={s.subhead}>การออกกำลังกายด้วยกันจะช่วยให้มีวินัยมากขึ้นถึง 40%</Text>

              <View style={s.couplePromo}>
                <View style={s.coupleIconStack}>
                    <View style={[s.avatarCircle, { backgroundColor: Palette.mossLt }]}><User size={24} color={Palette.moss} /></View>
                    <View style={[s.avatarCircle, { backgroundColor: Palette.terraLt, marginLeft: -15 }]}><Heart size={20} color={Palette.terra} fill={Palette.terra} /></View>
                </View>
                <Text style={s.promoTitle}>Couple Sync Mode</Text>
                <Text style={s.promoSub}>ดู Progress ของแฟนได้แบบ Real-time และส่งกำลังใจให้กันได้ทุกวัน</Text>
                
                <View style={s.codeBox}>
                    <Text style={s.codeLabel}>รหัสเชิญของคุณ</Text>
                    <Text style={s.codeValue}>FP-2847</Text>
                    <Pressable style={s.copyBtn} onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}>
                        <Text style={s.copyText}>คัดลอกรหัส</Text>
                    </Pressable>
                </View>
              </View>

              <Pressable style={s.skipLink} onPress={goNext}>
                 <Text style={s.skipText}>ข้ามขั้นตอนนี้ไปก่อน</Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>

        {/* Footer Navigation */}
        <View style={s.footer}>
            <Pressable 
              style={({ pressed }) => [
                s.nextBtn, 
                { backgroundColor: Palette.moss },
                pressed && { scale: 0.98 }
              ]} 
              onPress={goNext}
            >
              <Text style={s.nextBtnText}>
                {step < TOTAL_STEPS - 1 ? 'ไปต่อ' : 'เริ่มต้นใช้งาน'}
              </Text>
              <ArrowRight size={20} color="white" strokeWidth={2.5} />
            </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, onBlur, placeholder, keyboardType = 'default', error, maxLength }: any) {
  return (
    <View style={s.fieldWrapper}><View style={s.labelRow}><Text style={s.fieldLabel}>{label}</Text>{error ? <Text style={s.errorLabel}>{error}</Text> : null}</View><TextInput style={[s.textInput, error && { borderColor: Palette.danger, backgroundColor: Palette.dangerLt }]} value={value} onChangeText={onChangeText} onBlur={onBlur} placeholder={placeholder} placeholderTextColor={Palette.inkFaint} keyboardType={keyboardType} maxLength={maxLength} /></View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 20,
  },
  progressSlot: {
    flex: 1,
    height: 4,
    backgroundColor: Palette.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headline: {
    fontFamily: Font.displayBold,
    fontSize: 32,
    color: Palette.ink,
    letterSpacing: -1,
  },
  subhead: {
    fontFamily: Font.body,
    fontSize: 16,
    color: Palette.inkMid,
    lineHeight: 24,
    marginBottom: 32,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 13,
    color: Palette.inkMid,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorLabel: {
    fontFamily: Font.displayBold,
    fontSize: 11,
    color: Palette.danger,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Palette.surface,
    height: 60,
    borderRadius: Radius.r3,
    paddingHorizontal: 20,
    fontFamily: Font.bodyMedium,
    fontSize: 16,
    color: Palette.ink,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  genderCard: {
    flex: 1,
    height: 56,
    backgroundColor: Palette.surface,
    borderRadius: Radius.r3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  genderCardActive: {
    backgroundColor: Palette.mossLt,
    borderColor: Palette.moss,
  },
  genderText: {
    fontFamily: Font.displayMedium,
    fontSize: 15,
    color: Palette.inkMid,
  },
  genderTextActive: {
    color: Palette.moss,
  },
  bmiCard: {
    backgroundColor: Palette.mossDim,
    padding: 20,
    borderRadius: Radius.r4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.moss + '20',
  },
  bmiTitle: {
    fontFamily: Font.displayMedium,
    fontSize: 14,
    color: Palette.inkMid,
  },
  bmiStatus: {
    fontFamily: Font.displayBold,
    fontSize: 18,
    color: Palette.moss,
  },
  bmiValue: {
    fontFamily: Font.displayBold,
    fontSize: 32,
    color: Palette.moss,
  },
  goalCard: {
    backgroundColor: Palette.surface,
    padding: 20,
    borderRadius: Radius.r4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.divider,
    ...Shadow.sm,
  },
  goalCardActive: {
    backgroundColor: Palette.mossLt,
    borderColor: Palette.moss,
  },
  goalTitle: {
    fontFamily: Font.displayBold,
    fontSize: 17,
    color: Palette.ink,
  },
  goalTitleActive: {
    color: Palette.moss,
  },
  goalSub: {
    fontFamily: Font.body,
    fontSize: 14,
    color: Palette.inkMid,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Palette.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: Palette.moss,
    borderColor: Palette.moss,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthCard: {
    width: '48%',
    backgroundColor: Palette.surface,
    padding: 16,
    borderRadius: Radius.r4,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  healthCardActive: {
    backgroundColor: Palette.mossLt,
    borderColor: Palette.moss,
  },
  healthTitle: {
    fontFamily: Font.displayMedium,
    fontSize: 14,
    color: Palette.inkMid,
    textAlign: 'center',
  },
  healthTitleActive: {
    color: Palette.moss,
  },
  anemiaAlert: {
    marginTop: 20,
    backgroundColor: Palette.dangerLt,
    padding: 16,
    borderRadius: Radius.r3,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  anemiaText: {
    flex: 1,
    fontFamily: Font.body,
    fontSize: 14,
    color: Palette.danger,
    lineHeight: 20,
  },
  couplePromo: {
    backgroundColor: Palette.surface,
    padding: 24,
    borderRadius: Radius.r5,
    alignItems: 'center',
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  coupleIconStack: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Palette.surface,
    ...Shadow.sm,
  },
  promoTitle: {
    fontFamily: Font.displayBold,
    fontSize: 22,
    color: Palette.ink,
    marginBottom: 4,
  },
  promoSub: {
    fontFamily: Font.body,
    fontSize: 15,
    color: Palette.inkMid,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  codeBox: {
    width: '100%',
    backgroundColor: Palette.bg,
    padding: 20,
    borderRadius: Radius.r4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.divider,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontFamily: Font.displayMedium,
    fontSize: 12,
    color: Palette.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeValue: {
    fontFamily: Font.displayBold,
    fontSize: 32,
    color: Palette.moss,
    letterSpacing: 4,
    marginBottom: 16,
  },
  copyBtn: {
    backgroundColor: Palette.mossLt,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  copyText: {
    fontFamily: Font.displayBold,
    fontSize: 14,
    color: Palette.moss,
  },
  skipLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: Font.displayMedium,
    fontSize: 15,
    color: Palette.inkFaint,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Palette.bg,
  },
  nextBtn: {
    height: 64,
    borderRadius: Radius.r4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Shadow.md,
  },
  nextBtnText: {
    fontFamily: Font.displayBold,
    fontSize: 18,
    color: 'white',
  }
});