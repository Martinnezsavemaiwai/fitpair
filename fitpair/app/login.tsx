import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Layout, 
  interpolateColor, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { Palette, Space, FontSize, Radius, Font, Shadow, Anim } from '@/constants/DS';
import { useApp } from '@/context/AppContext';
import { Mail, Lock, ArrowRight, Heart, Loader2, Sparkles, UserPlus, LogIn } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const transitionProgress = useSharedValue(0);

  useEffect(() => {
    transitionProgress.value = withTiming(isLogin ? 0 : 1, { duration: 400 });
  }, [isLogin]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error: authError } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (authError) {
      if (authError.status === 422) {
        setError(isLogin ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'อีเมลนี้ถูกใช้งานไปแล้ว');
      } else if (authError.status === 400 || authError.status === 401) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (authError.status === 429) {
        setError('คุณสมัครสมาชิกบ่อยเกินไป กรุณารอสัก 1-2 นาทีแล้วลองใหม่ครับ');
      } else {
        setError(authError.message);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      transitionProgress.value,
      [0, 1],
      [Palette.bg, Palette.bg] // Keep subtle for now
    );
    return { backgroundColor };
  });

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} bounces={false} showsVerticalScrollIndicator={false}>
          
          {/* Top Decorative Elements */}
          <Animated.View entering={FadeInDown.delay(100)} style={s.decorativeDots}>
            <View style={[s.dot, { backgroundColor: Palette.terraLt }]} />
            <View style={[s.dot, { backgroundColor: Palette.mossLt, marginHorizontal: 8 }]} />
            <View style={[s.dot, { backgroundColor: Palette.infoLt }]} />
          </Animated.View>

          {/* Header Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={[s.header, animatedHeaderStyle]}>
            <View style={s.logoWrapper}>
              <Animated.View style={s.logoCircle}>
                <Heart size={36} color={Palette.terra} fill={Palette.terra} />
              </Animated.View>
              <View style={s.logoBadge}>
                <Sparkles size={12} color="white" fill="white" />
              </View>
            </View>
            <Text style={s.title}>FitPair</Text>
            <Text style={s.subtitle}>
              {isLogin ? 'ยินดีต้อนรับกลับมาครับ' : 'มาเริ่มต้นดูแลกันและกัน'}
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View entering={FadeInUp.delay(400)} layout={Layout.springify()} style={s.card}>
            <Text style={s.cardTitle}>{isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}</Text>
            
            <View style={s.inputGroup}>
              <View style={s.inputWrapper}>
                <Mail size={18} color={Palette.inkMid} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="อีเมล"
                  placeholderTextColor={Palette.inkFaint}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={s.inputWrapper}>
                <Lock size={18} color={Palette.inkMid} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="รหัสผ่าน (6+ ตัวอักษร)"
                  placeholderTextColor={Palette.inkFaint}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {error && (
              <Animated.View entering={FadeInDown} style={s.errorBadge}>
                <Text style={s.errorText}>{error}</Text>
              </Animated.View>
            )}

            <Pressable 
              style={({ pressed }) => [
                s.submitBtn,
                pressed && { transform: [{ scale: 0.98 }] }
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={isLogin ? [Palette.terra, Palette.terra] : [Palette.moss, Palette.moss]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.gradient}
              >
                {loading ? (
                  <Loader2 size={24} color="white" />
                ) : (
                  <>
                    <Text style={s.submitText}>{isLogin ? 'เข้าสู่ระบบ' : 'เริ่มใช้งานฟรี'}</Text>
                    {isLogin ? <LogIn size={18} color="white" /> : <UserPlus size={18} color="white" />}
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={s.dividerContainer}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>หรือ</Text>
              <View style={s.dividerLine} />
            </View>

            <Pressable 
              style={s.toggleBtn}
              onPress={() => {
                setIsLogin(!isLogin);
                setError(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={s.toggleLabel}>
                {isLogin ? 'ยังไม่มีบัญชีสมาชิก?' : 'มีบัญชีสมาชิกอยู่แล้ว?'}
              </Text>
              <Text style={[s.toggleAction, { color: isLogin ? Palette.terra : Palette.moss }]}>
                {isLogin ? 'สร้างบัญชีที่นี่' : 'เข้าสู่ระบบที่นี่'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Dev Bypass Button */}
          {__DEV__ && (
            <Animated.View entering={FadeInUp.delay(800)}>
              <Pressable 
                style={s.devBypass}
                onPress={async () => {
                   await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                   // Mock login as a new user
                   router.replace('/onboarding');
                }}
              >
                <Text style={s.devBypassText}>🛠 Dev Bypass: ข้ามไปหน้า Onboarding</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Social Proof / Encouragement */}
          <Animated.View entering={FadeInUp.delay(600)} style={s.socialProof}>
            <Text style={s.socialText}>เข้าร่วมกับคู่รักกว่า 10,000+ คู่ทั่วโลก</Text>
            <View style={s.miniHearts}>
              <Heart size={12} color={Palette.terra} fill={Palette.terra} style={{opacity: 0.4}} />
              <Heart size={12} color={Palette.moss} fill={Palette.moss} style={{opacity: 0.4, marginHorizontal: 4}} />
              <Heart size={12} color={Palette.info} fill={Palette.info} style={{opacity: 0.4}} />
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Space.sp5,
    paddingTop: 40,
    paddingBottom: 40,
  },
  decorativeDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 10,
    borderRadius: Radius.r4,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  logoBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Palette.caution,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Palette.bg,
  },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.hero,
    color: Palette.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.base,
    color: Palette.inkMid,
    marginTop: 4,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.r4,
    padding: Space.sp5,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  cardTitle: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
    color: Palette.ink,
    marginBottom: Space.sp5,
  },
  inputGroup: {
    gap: Space.sp3,
    marginBottom: Space.sp5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderRadius: Radius.r3,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Font.bodyMedium,
    fontSize: FontSize.base,
    color: Palette.ink,
  },
  errorBadge: {
    backgroundColor: Palette.dangerLt,
    padding: 12,
    borderRadius: Radius.r2,
    marginBottom: Space.sp4,
    borderWidth: 1,
    borderColor: Palette.danger + '20',
  },
  errorText: {
    color: Palette.danger,
    fontFamily: Font.bodyMedium,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  submitBtn: {
    borderRadius: Radius.r3,
    overflow: 'hidden',
    ...Shadow.md,
  },
  gradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Space.sp5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.divider,
  },
  dividerText: {
    fontFamily: Font.body,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    marginHorizontal: 10,
  },
  toggleBtn: {
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    color: Palette.inkMid,
  },
  toggleAction: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
  },
  socialProof: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  socialText: {
    fontFamily: Font.bodyMedium,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    letterSpacing: 0.5,
  },
  miniHearts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  devBypass: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Palette.divider,
    borderRadius: Radius.r2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.inkFaint + '20',
  },
  devBypassText: {
    fontFamily: Font.bodyMedium,
    fontSize: FontSize.xs,
    color: Palette.inkMid,
  },
});
