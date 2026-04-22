/**
 * AppContext.tsx
 * Global state with AsyncStorage persistence.
 * Resets daily checks at midnight automatically.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from "react";
import {
  userColor as _uc,
  userColorLt as _ucl,
  userGradient as _ug
} from "@/constants/DS";
import { supabase } from "@/lib/supabase";
import * as Device from 'expo-device';

// ─── STORAGE POLYFILL ─────────────────────────────────────────────
// Robust fallback for environments where AsyncStorage might fail to resolve
let Storage: any;
try {
  Storage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  console.warn("AsyncStorage not found, using memory storage");
  Storage = {
    getItem: async () => null,
    setItem: async () => { },
    removeItem: async () => { },
    clear: async () => { },
  };
}
const AsyncStorage = Storage;

// ─── TYPES ────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";

export type GoalId =
  | "sixpack"
  | "lean"
  | "health"
  | "gain"
  | "eleven"   // ร่อง 11
  | "endurance";

export type HealthFlag =
  | "anemia"
  | "heart"
  | "knee"
  | "back"
  | "diabetes"
  | "none";

export interface UserProfile {
  name: string;
  weight: number;      // kg
  height: number;      // cm
  gender: Gender;
  goal: GoalId;
  healthFlags: HealthFlag[];
  avatar?: string;     // emoji or URI
}

export interface DailyChecks {
  workout: boolean;
  nutrition: boolean;  // water (me) / iron (partner)
  macro: boolean;      // protein (me) / vitC (partner)
  sleep: boolean;
  water: number;       // cups of water
  nudgeReceived: boolean; // if partner nudged you
  date: string;        // ISO date "YYYY-MM-DD"
}

export interface MealLog {
  id: string;
  date: string;
  logged: boolean;
}

export interface ExerciseDone {
  index: number;
  date: string;
}

export interface AppState {
  isOnboarded: boolean;
  activeUser: "me" | "partner";
  me: UserProfile;
  partner: UserProfile;
  coupleConnected: boolean;
  coupleCode: string;
  checksMe: DailyChecks;
  checksPartner: DailyChecks;
  loggedMeals: MealLog[];
  donExercises: ExerciseDone[];
  streakMe: number;
  streakPartner: number;
  lastStreakDateMe: string;
  lastStreakDatePartner: string;
  userId: string | null;
  partnerId: string | null;
}

// ─── DEFAULTS ─────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const DEFAULT_ME: UserProfile = {
  name: "มาติน",
  weight: 54,
  height: 161,
  gender: "male",
  goal: "sixpack",
  healthFlags: [],
  avatar: "user",
};

const DEFAULT_PARTNER: UserProfile = {
  name: "มิน",
  weight: 43,
  height: 155,
  gender: "female",
  goal: "eleven",
  healthFlags: ["anemia"],
  avatar: "flower",
};

const defaultChecks = (): DailyChecks => ({
  workout: false,
  nutrition: false,
  macro: false,
  sleep: false,
  water: 0,
  nudgeReceived: false,
  date: today(),
});

const INITIAL_STATE: AppState = {
  isOnboarded: false,
  activeUser: "me",
  me: DEFAULT_ME,
  partner: DEFAULT_PARTNER,
  coupleConnected: true,   // mock connected for demo
  coupleCode: "FP-2847",
  checksMe: defaultChecks(),
  checksPartner: { ...defaultChecks(), workout: true, nutrition: true }, // mock partner progress
  loggedMeals: [],
  donExercises: [],
  streakMe: 5,
  streakPartner: 3,
  lastStreakDateMe: today(),
  lastStreakDatePartner: today(),
  userId: null,
  partnerId: null,
};

// ─── ACTIONS ──────────────────────────────────────────────────────

type Action =
  | { type: "HYDRATE"; payload: Partial<AppState> }
  | { type: "SET_ONBOARDED" }
  | { type: "SET_ACTIVE_USER"; payload: "me" | "partner" }
  | { type: "SET_ME"; payload: Partial<UserProfile> }
  | { type: "SET_PARTNER"; payload: Partial<UserProfile> }
  | { type: "TOGGLE_CHECK"; payload: { user: "me" | "partner"; key: keyof DailyChecks } }
  | { type: "LOG_MEAL"; payload: { id: string; logged: boolean } }
  | { type: "COMPLETE_EXERCISE"; payload: number }
  | { type: "RESET_EXERCISES" }
  | { type: "RESET_DAILY"; payload: { user: "me" | "partner" } }
  | { type: "CONNECT_COUPLE"; payload: { code: string; partnerId: string | null } }
  | { type: "INCREMENT_STREAK"; payload: "me" | "partner" }
  | { type: "ADD_WATER"; payload: { user: "me" | "partner"; amount: number } }
  | { type: "SEND_NUDGE"; payload: { to: "me" | "partner" } }
  | { type: "CLEAR_NUDGE"; payload: { user: "me" | "partner" } }
  | { type: "RESET"; payload: { userId: string | null } };

// ─── REDUCER ──────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };

    case "RESET":
      return { ...INITIAL_STATE, userId: action.payload.userId };

    case "SET_ONBOARDED":
      return { ...state, isOnboarded: true };

    case "SET_ACTIVE_USER":
      return { ...state, activeUser: action.payload };

    case "SET_ME":
      return { ...state, me: { ...state.me, ...action.payload } };

    case "SET_PARTNER":
      return { ...state, partner: { ...state.partner, ...action.payload } };

    case "TOGGLE_CHECK": {
      const { user, key } = action.payload;
      if (key === "date") return state; // guard
      if (user === "me") {
        const updated = { ...state.checksMe, [key]: !state.checksMe[key] };
        return { ...state, checksMe: updated };
      } else {
        const updated = { ...state.checksPartner, [key]: !state.checksPartner[key] };
        return { ...state, checksPartner: updated };
      }
    }

    case "LOG_MEAL": {
      const { id, logged } = action.payload;
      const existing = state.loggedMeals.findIndex(
        (m) => m.id === id && m.date === today()
      );
      if (existing >= 0) {
        const updated = [...state.loggedMeals];
        updated[existing] = { ...updated[existing], logged };
        return { ...state, loggedMeals: updated };
      }
      return {
        ...state,
        loggedMeals: [...state.loggedMeals, { id, date: today(), logged }],
      };
    }

    case "COMPLETE_EXERCISE": {
      const already = state.donExercises.find(
        (e) => e.index === action.payload && e.date === today()
      );
      if (already) return state;
      return {
        ...state,
        donExercises: [
          ...state.donExercises,
          { index: action.payload, date: today() },
        ],
      };
    }

    case "RESET_EXERCISES":
      return {
        ...state,
        donExercises: state.donExercises.filter((e) => e.date !== today()),
      };

    case "RESET_DAILY": {
      const emptyChecks = defaultChecks();
      if (action.payload.user === "me") {
        return { ...state, checksMe: emptyChecks };
      }
      return { ...state, checksPartner: emptyChecks };
    }

    case "CONNECT_COUPLE":
      return { 
        ...state, 
        coupleConnected: true, 
        coupleCode: action.payload.code,
        partnerId: action.payload.partnerId 
      };

    case "INCREMENT_STREAK": {
      if (action.payload === "me") {
        return {
          ...state,
          streakMe: state.streakMe + 1,
          lastStreakDateMe: today(),
        };
      }
      return {
        ...state,
        streakPartner: state.streakPartner + 1,
        lastStreakDatePartner: today(),
      };
    }

    case "ADD_WATER": {
      const { user, amount } = action.payload;
      const key = user === "me" ? "checksMe" : "checksPartner";
      return {
        ...state,
        [key]: {
          ...state[key],
          water: Math.max(0, state[key].water + amount),
        },
      };
    }

    case "SEND_NUDGE": {
      const key = action.payload.to === "me" ? "checksMe" : "checksPartner";
      return {
        ...state,
        [key]: {
          ...state[key],
          nudgeReceived: true,
        },
      };
    }

    case "CLEAR_NUDGE": {
      const key = action.payload.user === "me" ? "checksMe" : "checksPartner";
      return {
        ...state,
        [key]: {
          ...state[key],
          nudgeReceived: false,
        },
      };
    }

    default:
      return state;
  }
}

// ─── STORAGE KEYS ─────────────────────────────────────────────────

const STORAGE_KEY = "@fitpair_v2_state";
const PERSIST_KEYS: (keyof AppState)[] = [
  "isOnboarded",
  "me",
  "partner",
  "coupleConnected",
  "coupleCode",
  "activeUser",
  "checksMe",
  "checksPartner",
  "streakMe",
  "streakPartner",
  "lastStreakDateMe",
  "lastStreakDatePartner",
  "loggedMeals",
  "donExercises",
  "userId",
  "partnerId",
];

// ─── CONTEXT ──────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  activeUser: "me" | "partner";
  dispatch: React.Dispatch<Action>;
  // Convenience helpers
  setOnboarded: () => void;
  setMe: (profile: Partial<UserProfile>) => void;
  setPartner: (profile: Partial<UserProfile>) => void;
  setActiveUser: (user: "me" | "partner") => void;
  toggleCheck: (user: "me" | "partner", key: keyof DailyChecks) => void;
  logMeal: (id: string, logged: boolean) => void;
  completeExercise: (index: number) => void;
  // Auth
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  // Couple Linking
  connectCouple: (code: string) => Promise<{ error: string | null }>;
  myInviteCode: string;
  // Derived
  activeProfile: UserProfile;
  activeChecks: DailyChecks;
  checksDoneCount: (user: "me" | "partner") => number;
  isMealLogged: (id: string) => boolean;
  isExerciseDone: (index: number) => boolean;
  addWater: (amount: number) => void;
  sendNudge: () => void;
  clearNudge: () => void;
  userId: string | null;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isLoading, setIsLoading] = React.useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(state.userId);

  // Sync ref with state
  useEffect(() => {
    userIdRef.current = state.userId;
  }, [state.userId]);

  // ── Auth & Cloud Sync on Mount
  useEffect(() => {
    // 1. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (userIdRef.current !== session.user.id) {
          // ถ้า ID ไม่ตรงกับที่มีอยู่ (เช่น ล็อกอินใหม่) ให้รีเซ็ตข้อมูลเป็นคนใหม่
          dispatch({ type: "RESET", payload: { userId: session.user.id } });
          fetchCloudProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: "RESET", payload: { userId: null } });
      }
    });

    // 2. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: "HYDRATE", payload: { userId: session.user.id } });
        fetchCloudProfile(session.user.id);
      } else {
        hydrateFromLocal();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCloudProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
      if (data && !error) {
        let partnerData = null;
        if (data.partner_id) {
          const { data: pData } = await supabase.from('profiles').select('*').eq('id', data.partner_id).single();
          if (pData) partnerData = pData;
        }

        dispatch({
          type: "HYDRATE",
          payload: {
            me: {
              ...state.me,
              name: data.name,
              avatar: data.avatar_url,
              goal: data.goal,
              weight: data.weight,
              height: data.height,
              gender: data.gender || state.me.gender,
              healthFlags: data.health_flags || state.me.healthFlags,
            },
            partnerId: data.partner_id,
            coupleCode: data.couple_code,
            coupleConnected: !!data.partner_id,
            ...(partnerData && {
              partner: {
                name: partnerData.name,
                avatar: partnerData.avatar_url,
                goal: partnerData.goal,
                weight: partnerData.weight,
                height: partnerData.height,
                gender: partnerData.gender,
                healthFlags: partnerData.health_flags || [],
              }
            })
          }
        });
      }
    } catch (e) { 
      console.error("Fetch Cloud Profile Error:", e); 
    } finally {
      setIsLoading(false);
    }
  };

  const hydrateFromLocal = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: persisted });
      }
    } catch (e) { console.warn("Hydrate Local Error:", e); }
    setIsLoading(false);
  };

  const signIn = async (email: string, pass: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string) => {
    const res = await supabase.auth.signUp({ email, password: pass });
    return { error: res.error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    dispatch({ type: "RESET", payload: { userId: null } });
  };

  // ─── Couple Linking ───────────────────────────────────────────────

  // Generate a stable invite code from the user's ID (first 6 chars)
  const myInviteCode = state.userId
    ? `FP-${state.userId.slice(0, 6).toUpperCase()}`
    : state.coupleCode || 'FP-??????';

  const connectCouple = async (code: string): Promise<{ error: string | null }> => {
    if (!state.userId) return { error: 'กรุณาเข้าสู่ระบบก่อนครับ' };

    const trimmed = code.trim().toUpperCase();
    if (!trimmed.startsWith('FP-') || trimmed.length < 9) {
      return { error: 'รูปแบบโค้ดไม่ถูกต้อง (ต้องเป็น FP-XXXXXX)' };
    }

    // Extract partner userId prefix from invite code
    const partnerIdPrefix = trimmed.replace('FP-', '').toLowerCase();

    try {
      // Look up partner profile by ID prefix
      const { data: partners, error: findErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('id', `${partnerIdPrefix}%`)
        .neq('id', state.userId)
        .limit(1);

      if (findErr) throw findErr;
      if (!partners || partners.length === 0) {
        return { error: 'ไม่พบโค้ดนี้ในระบบ ลองตรวจสอบโค้ดใหม่อีกครั้งนะครับ' };
      }

      const partnerProfile = partners[0];

      // Save partner_id in our own profile
      const { error: linkErr } = await supabase
        .from('profiles')
        .update({ partner_id: partnerProfile.id, couple_code: trimmed })
        .eq('id', state.userId);

      if (linkErr) throw linkErr;

      // Also save reverse link on partner's profile
      await supabase
        .from('profiles')
        .update({ partner_id: state.userId })
        .eq('id', partnerProfile.id);

      // Update local state
      dispatch({ type: "CONNECT_COUPLE", payload: { 
        code: trimmed, 
        partnerId: partnerProfile.id 
      }});
      dispatch({ type: "SET_PARTNER", payload: {
        name: partnerProfile.name || 'แฟน',
        avatar: partnerProfile.avatar_url,
        goal: partnerProfile.goal,
        weight: partnerProfile.weight,
        height: partnerProfile.height,
      }});

      return { error: null };
    } catch (e: any) {
      console.error('connectCouple error:', e);
      return { error: e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่ครับ' };
    }
  };

  // ── Persist to Cloud (Supabase)
  useEffect(() => {
    if (isLoading || !state.userId) return;

    const syncCloud = async () => {
      try {
        console.log("☁️ [Cloud Sync] กำลังส่งข้อมูลไปที่ Supabase... (ID: " + state.userId + ")");
        
        // 1. Sync Profile
        const { error: pError } = await supabase.from('profiles').upsert({
          id: state.userId,
          name: state.me.name,
          avatar_url: state.me.avatar,
          goal: state.me.goal,
          weight: state.me.weight,
          height: state.me.height,
          gender: state.me.gender,
          health_flags: state.me.healthFlags,
          partner_id: state.partnerId,
          couple_code: state.coupleCode,
        });

        if (pError) throw pError;

        // 2. Sync Daily Checks
        const { error: dError } = await supabase.from('daily_activity').upsert({
          user_id: state.userId,
          date: today(),
          water_count: state.checksMe.water,
          workout_done: state.checksMe.workout,
          nutrition_done: state.checksMe.nutrition,
          macro_done: state.checksMe.macro,
          sleep_done: state.checksMe.sleep,
        }, { onConflict: 'user_id,date' });

        if (dError) throw dError;

        console.log("✅ [Cloud Sync] สำเร็จ!");
      } catch (e) {
        console.error("❌ [Cloud Sync Error]:", e);
      }
    };

    const timer = setTimeout(syncCloud, 2500); 
    return () => clearTimeout(timer);
  }, [state.me, state.checksMe, state.userId, isLoading]);

  // ── Realtime Subscriptions
  useEffect(() => {
    if (!state.userId) return;

    const channels: import("@supabase/supabase-js").RealtimeChannel[] = [];

    // 1. Own Profile & Activity
    const pChan = supabase.channel('my-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${state.userId}` }, (payload) => {
        // Only update if external change (e.g. from another device)
        // For simplicity, we just fetch again or hydrate
      })
      .subscribe();
    channels.push(pChan);

    // 2. Partner Updates (Crucial for live feeling!)
    if (state.partnerId) {
      const partChan = supabase.channel('partner-updates')
        // Monitor partner's profile
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${state.partnerId}` }, (payload) => {
          const d = payload.new as any;
          dispatch({ type: "SET_PARTNER", payload: {
            name: d.name,
            avatar: d.avatar_url,
            goal: d.goal,
            weight: d.weight,
            height: d.height,
            gender: d.gender,
            healthFlags: d.health_flags,
          }});
        })
        // Monitor partner's daily activity
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_activity', filter: `user_id=eq.${state.partnerId}` }, (payload) => {
          const d = payload.new as any;
          if (d && d.date === today()) {
            dispatch({ type: "HYDRATE", payload: {
              checksPartner: {
                ...state.checksPartner,
                workout: !!d.workout_done,
                nutrition: !!d.nutrition_done,
                macro: !!d.macro_done,
                sleep: !!d.sleep_done,
                water: Number(d.water_count || 0),
                date: String(d.date)
              }
            }});
          }
        })
        .subscribe();
      channels.push(partChan);
    }

    return () => {
      channels.forEach(c => supabase.removeChannel(c));
    };
  }, [state.userId, state.partnerId]);

  // ── Persist on every state change (debounced 400ms)
  useEffect(() => {
    if (isLoading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const toPersist: Partial<AppState> = {};
        for (const key of PERSIST_KEYS) {
          (toPersist as Record<string, unknown>)[key] = state[key];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
      } catch (e) {
        console.warn("AppContext persist error:", e);
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, isLoading]);

  // ── Couple Sync Mock ──────────────────────────────────────────────
  // Periodically complete partner's tasks to simulate real-time sync
  useEffect(() => {
    if (isLoading || !state.coupleConnected) return;

    // Run every 30 seconds for demo
    const timer = setInterval(() => {
      const keys: (keyof DailyChecks)[] = ["workout", "nutrition", "macro", "sleep"];
      const pending = keys.filter(k => !state.checksPartner?.[k] && k !== "date");

      if (pending.length > 0) {
        // Pick random pending task
        const randomKey = pending[Math.floor(Math.random() * pending.length)];
        dispatch({ type: "TOGGLE_CHECK", payload: { user: "partner", key: randomKey } });
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [isLoading, state.coupleConnected, state.checksPartner]);


  // ─── Helpers ────────────────────────────────────────────────────

  const setOnboarded = useCallback(() => dispatch({ type: "SET_ONBOARDED" }), []);
  const setMe = useCallback(
    (p: Partial<UserProfile>) => dispatch({ type: "SET_ME", payload: p }),
    []
  );
  const setPartner = useCallback(
    (p: Partial<UserProfile>) => dispatch({ type: "SET_PARTNER", payload: p }),
    []
  );
  const setActiveUser = useCallback(
    (u: "me" | "partner") => dispatch({ type: "SET_ACTIVE_USER", payload: u }),
    []
  );
  const toggleCheck = useCallback(
    (user: "me" | "partner", key: keyof DailyChecks) =>
      dispatch({ type: "TOGGLE_CHECK", payload: { user, key } }),
    []
  );
  const logMeal = useCallback(
    (id: string, logged: boolean) =>
      dispatch({ type: "LOG_MEAL", payload: { id, logged } }),
    []
  );
  const completeExercise = useCallback(
    (index: number) => dispatch({ type: "COMPLETE_EXERCISE", payload: index }),
    []
  );

  const addWater = useCallback(
    (amount: number) => dispatch({ type: "ADD_WATER", payload: { user: state.activeUser, amount } }),
    [state.activeUser]
  );

  const sendNudge = useCallback(
    () => dispatch({ type: "SEND_NUDGE", payload: { to: state.activeUser === "me" ? "partner" : "me" } }),
    [state.activeUser]
  );

  const clearNudge = useCallback(
    () => dispatch({ type: "CLEAR_NUDGE", payload: { user: state.activeUser } }),
    [state.activeUser]
  );

  // ─── Derived ────────────────────────────────────────────────────

  const activeProfile = state.activeUser === "me" ? state.me : state.partner;
  const activeChecks = state.activeUser === "me" ? state.checksMe : state.checksPartner;

  const checksDoneCount = useCallback(
    (user: "me" | "partner") => {
      const checks = user === "me" ? state.checksMe : state.checksPartner;
      if (!checks) return 0;
      return (["workout", "nutrition", "macro", "sleep"] as const).filter(
        (k) => !!checks[k]
      ).length;
    },
    [state.checksMe, state.checksPartner]
  );

  const isMealLogged = useCallback(
    (id: string) =>
      state.loggedMeals?.some(
        (m) => m.id === id && m.date === today() && m.logged
      ) ?? false,
    [state.loggedMeals]
  );

  const isExerciseDone = useCallback(
    (index: number) =>
      state.donExercises?.some(
        (e) => e.index === index && e.date === today()
      ) ?? false,
    [state.donExercises]
  );

  const userId = state.userId;

  return (
    <AppContext.Provider
      value={{
        state,
        activeUser: state.activeUser,
        dispatch,
        setOnboarded,
        setMe,
        setPartner,
        setActiveUser,
        toggleCheck,
        logMeal,
        completeExercise,
        addWater,
        sendNudge,
        clearNudge,
        signIn,
        signUp,
        signOut,
        connectCouple,
        myInviteCode,
        userId,
        isLoading,
        activeProfile,
        activeChecks,
        checksDoneCount,
        isMealLogged,
        isExerciseDone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// ─── BACKWARD COMPAT RE-EXPORTS ───────────────────────────────────
// These were previously defined here; now live in constants/DS.ts.
// Re-exported so existing screens (tabs/_layout, meal, progress,
// schedule) compile without changes during gradual migration.

export function userColor(user: "me" | "partner") { return _uc(user); }
export function userColorLight(user: "me" | "partner") { return _ucl(user); }
export function userGradient(user: "me" | "partner") { return _ug(user); }