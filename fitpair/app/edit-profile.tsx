import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Palette, Space, FontSize, Radius, Font, Shadow, userColor, userColorLt } from '@/constants/DS';
import { useApp, GoalId, Gender } from '@/context/AppContext';
import { ArrowLeft, User, UserCheck, Heart, Target, ChevronRight, Check, Image as ImageIcon, Loader } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const AVATARS = [
  'User', 'Heart', 'Star', 'Zap', 'Smile', 'Dumbbell', 'Flame', 'Trophy', 'Activity', 'Award'
];

const GOALS: { id: GoalId; label: string; sub: string }[] = [
  { id: 'sixpack', label: 'สร้าง Six Pack', sub: 'เน้นลดไขมันหน้าท้องและสร้างกล้ามเนื้อ' },
  { id: 'lean', label: 'ฟิตหุ่นลีน', sub: 'เผาผลาญไขมัน กระชับสัดส่วน' },
  { id: 'health', label: 'สุขภาพดี', sub: 'เน้นความแข็งแรงทั่วไปและการเผาผลาญ' },
  { id: 'gain', label: 'เพิ่มกล้ามเนื้อ', sub: 'เน้นการกินและเล่นหนักเพื่อเพิ่มขนาด' },
  { id: 'eleven', label: 'ร่อง 11', sub: 'สร้างแนวกล้ามเนื้อหน้าท้องที่สวยงาม' },
  { id: 'endurance', label: 'เพิ่มความอึด', sub: 'เน้น Cardio และความทนทานของปอด' },
];

export default function EditProfile() {
  const { state, activeUser, setMe, setPartner } = useApp();
  const router = useRouter();
  const profile = state[activeUser];
  
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState<GoalId>(profile.goal);
  const [avatar, setAvatar] = useState(profile.avatar || 'User');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  const col = userColor(activeUser);
  const colLt = userColorLt(activeUser);

  const handleSave = () => {
    if (!name.trim()) {
      setError("กรุณาระบุชื่อเล่น");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updates = { name, goal, avatar };
    if (activeUser === 'me') setMe(updates);
    else setPartner(updates);
    router.back();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;
    // Show local preview immediately
    setAvatar(localUri);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Upload to Supabase Storage in background
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch local image as blob
      const response = await fetch(localUri);
      const blob = await response.blob();
      const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true, contentType: `image/${ext}` });

      if (upErr) throw upErr;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setAvatar(publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      console.error('[Avatar Upload Error]:', e.message);
      // Keep local URI as fallback
    } finally {
      setUploading(false);
    }
  };

  const isUri = avatar.startsWith('file://') || avatar.startsWith('http') || avatar.startsWith('content://');
  const IconComp = (LucideIcons as any)[avatar] || LucideIcons.User;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={24} color={Palette.ink} />
        </Pressable>
        <Text style={s.title}>แก้ไขโปรไฟล์</Text>
        <Pressable onPress={handleSave} style={s.saveBtn}>
          <Text style={[s.saveBtnText, { color: col }]}>บันทึก</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.avatarSection}>
          <View style={[s.avatarCircle, { backgroundColor: colLt }]}>
            {isUri ? <Image source={{ uri: avatar }} style={s.avatarImage} /> : <IconComp size={48} color={col} strokeWidth={2} />}
          </View><Pressable style={[s.uploadBtn, uploading && { opacity: 0.6 }]} onPress={pickImage} disabled={uploading}>
            {uploading ? <Loader size={16} color={col} /> : <ImageIcon size={16} color={col} />}<Text style={[s.uploadBtnText, { color: col }]}>{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}</Text>
          </Pressable><Text style={s.avatarTitle}>หรือเลือกไอคอน</Text><View style={s.avatarGrid}>
            {AVATARS.map((iconName) => {
              const ItemIcon = (LucideIcons as any)[iconName];
              const isSelected = avatar === iconName;
              return (
                <Pressable
                  key={iconName}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAvatar(iconName);
                  }}
                  style={[
                    s.avatarItem,
                    isSelected && { backgroundColor: col, borderColor: col }
                  ]}
                ><ItemIcon size={20} color={isSelected ? 'white' : Palette.inkMid} /></Pressable>
              );
            })}
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={s.section}>
          <View style={s.labelRow}><Text style={s.sectionLabel}>ชื่อเล่น</Text>{error ? <Text style={s.errorLabel}>{error}</Text> : null}</View><TextInput
            style={[s.input, error && { color: Palette.danger }]}
            value={name}
            onChangeText={(t) => { setName(t); setError(""); }}
            placeholder="ใส่ชื่อของคุณ"
            placeholderTextColor={Palette.inkFaint}
          />
        </Animated.View><Animated.View entering={FadeInDown.delay(200)} style={s.section}>
          <Text style={s.sectionLabel}>เป้าหมาย</Text><View style={s.goalList}>
            {GOALS.map((g) => {
              const isSelected = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGoal(g.id);
                  }}
                  style={[
                    s.goalCard,
                    isSelected && { borderColor: col, backgroundColor: colLt }
                  ]}
                ><View style={{ flex: 1 }}><Text style={[s.goalLabel, isSelected && { color: col }]}>{g.label}</Text><Text style={s.goalSub}>{g.sub}</Text></View>{isSelected ? <Check size={20} color={col} strokeWidth={3} /> : null}</Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.sp5,
    paddingVertical: Space.sp3,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  backBtn: { padding: 4 },
  title: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
    color: Palette.ink,
  },
  saveBtn: { padding: 4 },
  saveBtnText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
  },
  scroll: { paddingBottom: 60 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Space.sp6,
    borderBottomWidth: 8,
    borderBottomColor: Palette.divider + '44',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sp4,
    overflow: 'hidden',
    ...Shadow.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radius.full,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.divider,
    marginBottom: Space.sp6,
    ...Shadow.sm,
  },
  uploadBtnText: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.sm,
  },
  avatarTitle: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Space.sp4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Space.sp3,
    paddingHorizontal: Space.sp5,
  },
  avatarItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  section: {
    padding: Space.sp5,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  sectionLabel: {
    fontFamily: Font.displayMedium,
    fontSize: FontSize.xs,
    color: Palette.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.sp3,
  },
  errorLabel: {
    fontFamily: Font.displayBold,
    fontSize: 11,
    color: Palette.danger,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.lg,
    color: Palette.ink,
    paddingVertical: Space.sp2,
  },
  goalList: { gap: Space.sp3, marginTop: Space.sp2 },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.sp4,
    backgroundColor: Palette.surface,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  goalLabel: {
    fontFamily: Font.displayBold,
    fontSize: FontSize.base,
    color: Palette.ink,
    marginBottom: 2,
  },
  goalSub: {
    fontFamily: Font.body,
    fontSize: FontSize.xs,
    color: Palette.inkMid,
  }
});
