import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DS, Font, userColor, userGradient } from '@/constants/DS';
import { Card } from '@/components/ui/Card';
import { Ring } from '@/components/ui/Ring';
import { Tag } from '@/components/ui/Tag';
import { useApp } from '@/context/AppContext';
import { 
  Egg, 
  Wheat, 
  Apple, 
  Fish, 
  Beef, 
  Leaf, 
  AlertCircle, 
  PartyPopper,
  Droplets,
  Plus,
  Minus,
  Check
} from 'lucide-react-native';

const PLANS = {
  me: {
    target: { protein: 105, carb: 180, fat: 55 },
    current: { protein: 68, carb: 120, fat: 32 },
    meals: [
      { id: 'bk', time: '07:30', period: 'เช้า', icon: Egg, label: 'ไข่ต้ม + ขนมปังโฮลวีต', protein: 24, kcal: 280, tag: 'High Protein', color: DS.colors.orange },
      { id: 'lu', time: '12:00', period: 'กลางวัน', icon: Wheat, label: 'ข้าวกล้อง + อกไก่ + ผัก', protein: 38, kcal: 520, tag: 'Balanced', color: DS.colors.green },
      { id: 'sn', time: '16:00', period: 'บ่าย', icon: Apple, label: 'แอปเปิ้ล + อัลมอนด์', protein: 6, kcal: 180, tag: 'Fiber', color: DS.colors.amber },
    ]
  },
  partner: {
    target: { protein: 80, carb: 140, fat: 45 },
    current: { protein: 45, carb: 90, fat: 28 },
    meals: [
      { id: 'bk', time: '08:00', period: 'เช้า', icon: Egg, label: 'โอ๊ตมีล + ผลไม้รวม', protein: 18, kcal: 310, tag: 'Iron Rich', color: DS.colors.orange },
      { id: 'lu', time: '12:30', period: 'กลางวัน', icon: Fish, label: 'ปลาแซลมอนย่าง + ผักโขม', protein: 32, kcal: 450, tag: 'Omega-3', color: DS.colors.blue },
      { id: 'dn', time: '18:30', period: 'เย็น', icon: Beef, label: 'สเต็กเนื้อแดง + บรอกโคลี', protein: 28, kcal: 380, tag: 'High Iron', color: DS.colors.red },
    ]
  }
};

export default function MealScreen() {
  const { state, activeUser, activeChecks, addWater } = useApp();
  const [logged, setLogged] = React.useState<Record<string, boolean>>({});
  
  const plan = activeUser === 'me' ? PLANS.me : PLANS.partner;
  const color = userColor(activeUser);
  const gradient = userGradient(activeUser);

  const totalProtein = plan.current.protein + Object.values(logged).filter(Boolean).length * 10;
  const proteinPct = Math.min((totalProtein / plan.target.protein) * 100, 100);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nutrition</Text>
            <Text style={styles.subtitle}>เป้าหมายสารอาหารวันนี้</Text>
          </View>
          <View style={styles.streakBox}>
            <Leaf size={16} color={color} />
            <Text style={[styles.streakText, { color }]}>Day {activeUser === 'me' ? state.streakMe : state.streakPartner}</Text>
          </View>
        </View>

        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.macroCard}>
          <View style={styles.macroRow}>
            <View style={styles.ringContainer}>
              <Ring 
                size={110} 
                stroke={12} 
                pct={proteinPct} 
                bg="rgba(255,255,255,0.2)"
                color="#FFFFFF"
              />
              <View style={styles.ringCenter}>
                <Text style={styles.ringVal}>{Math.round(proteinPct)}%</Text>
                <Text style={styles.ringLabel}>PROTEIN</Text>
              </View>
            </View>

            <View style={styles.macroStats}>
              {[
                { label: 'PROTEIN', val: `${totalProtein}/${plan.target.protein}g` },
                { label: 'CARBS', val: `${plan.current.carb}/${plan.target.carb}g` },
                { label: 'FATS', val: `${plan.current.fat}/${plan.target.fat}g` },
              ].map((m, i) => (
                <View key={m.label} style={[styles.macroItem, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text style={styles.macroItemLabel}>{m.label}</Text>
                  <Text style={styles.macroItemVal}>{m.val}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {activeUser === 'partner' && (
          <View style={[styles.warning, { marginHorizontal: DS.spacing.page }]}>
            <AlertCircle size={20} color={DS.colors.red} />
            <Text style={styles.warningText}>
              หลีกเลี่ยงชา/กาแฟภายใน 2 ชม. หลังอาหาร — ขัดขวางการดูดซึมธาตุเหล็ก
            </Text>
          </View>
        )}

        {/* ─── WATER TRACKER ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.waterSection}>
          <View style={styles.waterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Droplets size={20} color={DS.colors.blue} />
              <Text style={styles.waterTitle}>Water Tracker</Text>
            </View>
            <Text style={styles.waterGoal}>{activeChecks.water || 0}/8 แก้ว</Text>
          </View>
          
          <View style={styles.waterRow}>
            <View style={styles.waterButtons}>
              <Pressable 
                style={styles.waterBtn} 
                onPress={() => addWater(-1)}
              >
                <Minus size={18} color={DS.colors.textMuted} />
              </Pressable>
              
              <View style={styles.waterCups}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const isFilled = i < (activeChecks.water || 0);
                  return (
                    <View 
                      key={i} 
                      style={[
                        styles.cup, 
                        isFilled && { backgroundColor: DS.colors.blue, borderColor: DS.colors.blue }
                      ]} 
                    />
                  );
                })}
              </View>

              <Pressable 
                style={[styles.waterBtn, { backgroundColor: DS.colors.blue + '15' }]} 
                onPress={() => addWater(1)}
              >
                <Plus size={18} color={DS.colors.blue} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>มื้ออาหารวันนี้</Text>
          <Text style={{ fontSize: 13, color: DS.colors.textMuted }}>
            {Object.values(logged).filter(Boolean).length}/{plan.meals.length} มื้อ
          </Text>
        </View>

        <View style={{ gap: 12, paddingHorizontal: DS.spacing.page }}>
          {plan.meals.map(meal => {
            const done = !!logged[meal.id];
            return (
              <Pressable key={meal.id} onPress={() => setLogged({ ...logged, [meal.id]: !done })}>
                <Card
                  style={[
                    styles.mealCard,
                    done && { borderColor: meal.color + '40', borderWidth: 1.5 },
                  ]}
                  shadow={done ? 'none' : 'sm'}
                  padding={0}
                >
                  <View style={[styles.timeStrip, { backgroundColor: meal.color + '12' }]}>
                    <Text style={[styles.timePeriod, { color: meal.color }]}>{meal.period}</Text>
                    <Text style={styles.timeVal}>{meal.time}</Text>
                    <Tag label={meal.tag} color={meal.color} />
                  </View>

                  <View style={styles.mealBody}>
                    <View style={[styles.iconBox, { backgroundColor: meal.color + '10' }]}>
                      <meal.icon size={22} color={meal.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mealLabel, done && { color: DS.colors.textMuted, textDecorationLine: 'line-through' }]}>
                        {meal.label}
                      </Text>
                      <Text style={styles.mealMeta}>{meal.kcal} kcal · {meal.protein}g protein</Text>
                    </View>
                    <View style={[styles.check, done && { backgroundColor: meal.color, borderColor: meal.color }]}>
                      {done && <Check size={14} color="white" strokeWidth={4} />}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {Object.values(logged).filter(Boolean).length === plan.meals.length && (
          <Animated.View entering={FadeInDown} style={styles.success}>
            <PartyPopper size={32} color={color} />
            <Text style={styles.successTitle}>ยอดเยี่ยม!</Text>
            <Text style={styles.successSub}>คุณบันทึกมื้ออาหารครบตามเป้าหมายแล้ว</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.colors.bg },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DS.spacing.page,
    paddingVertical: 20,
  },
  title: {
    fontFamily: Font.display,
    fontSize: DS.typography.h1.fontSize,
    color: DS.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: DS.colors.textMuted,
    marginTop: 2,
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  macroCard: {
    marginHorizontal: DS.spacing.page,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringVal: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  ringLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  macroStats: {
    flex: 1,
    gap: 8,
  },
  macroItem: {
    paddingVertical: 6,
  },
  macroItemLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  macroItemVal: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: DS.colors.redLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: DS.colors.red,
    lineHeight: 18,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DS.spacing.page,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DS.colors.text,
  },
  mealCard: {
    overflow: 'hidden',
    borderRadius: 22,
  },
  timeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  timePeriod: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeVal: {
    fontSize: 11,
    color: DS.colors.textMuted,
  },
  mealBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: DS.colors.text,
    marginBottom: 2,
  },
  mealMeta: {
    fontSize: 12,
    color: DS.colors.textMuted,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DS.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DS.colors.text,
    marginTop: 12,
  },
  successSub: {
    fontSize: 14,
    color: DS.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  waterSection: {
    marginHorizontal: DS.spacing.page,
    backgroundColor: DS.colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DS.colors.border,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DS.colors.text,
  },
  waterGoal: {
    fontSize: 13,
    color: DS.colors.blue,
    fontWeight: '700',
  },
  waterRow: {
    alignItems: 'center',
  },
  waterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  waterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: DS.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterCups: {
    flexDirection: 'row',
    gap: 6,
  },
  cup: {
    width: 14,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: DS.colors.border,
    backgroundColor: 'transparent',
  }
});
