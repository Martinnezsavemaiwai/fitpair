/**
 * app/index.tsx
 * Entry point — smart redirect.
 * Waits for AppContext hydration, then routes to the correct screen.
 *
 * Flow:
 *   First launch  → onboarding
 *   Returning     → (tabs) (dashboard)
 *
 * Shows nothing while loading (SplashScreen handles the visual).
 */

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/context/AppContext";

export default function Index() {
  const router = useRouter();
  const { state, isLoading, userId } = useApp();

  useEffect(() => {
    if (isLoading) return;

    if (!userId) {
      // 1. ถ้ายังไม่ล็อกอิน -> ไปหน้า Login
      router.replace("/login");
    } else if (!state.isOnboarded) {
      // 2. ถ้าล็อกอินแล้วแต่ยังไม่ตั้งค่า -> ไปหน้า Onboarding
      router.replace("/onboarding");
    } else {
      // 3. ครบถ้วน -> ไปหน้า Dashboard
      router.replace("/(tabs)");
    }
  }, [isLoading, userId, state.isOnboarded]);

  // Render nothing — SplashScreen covers this
  return null;
}