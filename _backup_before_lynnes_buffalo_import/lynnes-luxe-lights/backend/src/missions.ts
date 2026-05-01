import { UserId } from "./wallet";

export interface Mission {
  id: string;
  type: "daily_spins";
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

const missionsByUser = new Map<UserId, Mission>();

function createDailyMission(userId: UserId): Mission {
  const m: Mission = {
    id: "daily_spins",
    type: "daily_spins",
    target: 20,
    progress: 0,
    reward: 500,
    completed: false,
    claimed: false
  };
  missionsByUser.set(userId, m);
  return m;
}

export function getMissions(userId: UserId): Mission {
  let m = missionsByUser.get(userId);
  if (!m) m = createDailyMission(userId);
  return m;
}

export function incrementSpinMission(userId: UserId): Mission {
  const m = getMissions(userId);
  if (m.completed) return m;
  m.progress = Math.min(m.target, m.progress + 1);
  if (m.progress >= m.target) {
    m.completed = true;
  }
  return m;
}
