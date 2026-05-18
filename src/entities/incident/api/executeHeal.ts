import { apiClient } from "../../../shared/api/client";

// X-Api-Key는 .env.local에 VITE_HEAL_API_KEY=... 로 설정
const HEAL_API_KEY = import.meta.env.VITE_HEAL_API_KEY as string | undefined;

export async function executeHeal(recoveryActionId: string): Promise<void> {
  await apiClient.post(
    "/heal",
    { recovery_action_id: recoveryActionId },
    HEAL_API_KEY ? { headers: { "X-Api-Key": HEAL_API_KEY } } : undefined,
  );
}
