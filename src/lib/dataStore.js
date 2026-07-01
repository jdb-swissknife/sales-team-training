/**
 * dataStore.js - localStorage-based data layer
 * Replaces the original backend SDK entirely. Same async API pattern so React Query works unchanged.
 *
 * Entity collections are auto-created on first access. Seed content is injected
 * on first run via seedContentIfEmpty().
 */

const DB_PREFIX = "mv_coach_";

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function getAll(collection) {
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}${collection}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(collection, records) {
  localStorage.setItem(`${DB_PREFIX}${collection}`, JSON.stringify(records));
}

function sortByKey(records, sortBy) {
  if (!sortBy) return records;
  const desc = sortBy.startsWith("-");
  const key = desc ? sortBy.slice(1) : sortBy;
  return [...records].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    // Handle dates
    if (key.includes("date") || key.includes("created")) {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    } else {
      aVal = aVal ?? "";
      bVal = bVal ?? "";
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return desc ? bVal - aVal : aVal - bVal;
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return desc ? -cmp : cmp;
  });
}

function createEntityAPI(collection) {
  return {
    async list(sortBy) {
      let records = getAll(collection);
      records = sortByKey(records, sortBy);
      return records;
    },

    async filter(filters = {}, sortBy, limit) {
      let records = getAll(collection);
      Object.entries(filters).forEach(([key, value]) => {
        records = records.filter((r) => r[key] === value);
      });
      records = sortByKey(records, sortBy);
      if (limit) records = records.slice(0, limit);
      return records;
    },

    async getById(id) {
      return getAll(collection).find((r) => r.id === id) || null;
    },

    async create(data) {
      const records = getAll(collection);
      const now = new Date().toISOString();
      const newRecord = {
        ...data,
        id: genId(),
        created_date: now,
        updated_date: now,
      };
      records.push(newRecord);
      saveAll(collection, records);
      return newRecord;
    },

    async update(id, data) {
      const records = getAll(collection);
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Record not found");
      records[idx] = {
        ...records[idx],
        ...data,
        updated_date: new Date().toISOString(),
      };
      saveAll(collection, records);
      return records[idx];
    },

    async delete(id) {
      saveAll(
        collection,
        getAll(collection).filter((r) => r.id !== id)
      );
      return { success: true };
    },
  };
}

/* ── Auth (local, no server) ──────────────────────────────────────── */

function autoCreateGuest() {
  const guest = {
    id: genId(),
    full_name: "",
    email: "",
    role: "rep",
    team: "",
    xp: 0,
    level: 1,
    streak_days: 0,
    last_active_date: null,
    badges: [],
    created_date: new Date().toISOString(),
  };
  localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(guest));
  return guest;
}

const authAPI = {
  async me() {
    const raw = localStorage.getItem(`${DB_PREFIX}current_user`);
    if (!raw) return autoCreateGuest();
    return JSON.parse(raw);
  },

  async login(userData) {
    const existing = localStorage.getItem(`${DB_PREFIX}current_user`);
    const base = existing ? JSON.parse(existing) : {};
    const user = {
      ...base,
      ...userData,
      id: base.id || genId(),
      role: userData.role || base.role || "rep",
      xp: base.xp || 0,
      level: base.level || 1,
      streak_days: base.streak_days || 0,
      badges: base.badges || [],
      created_date: base.created_date || new Date().toISOString(),
    };
    localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem(`${DB_PREFIX}current_user`);
  },

  async updateUser(patch) {
    const current = JSON.parse(
      localStorage.getItem(`${DB_PREFIX}current_user`) || "{}"
    );
    const updated = { ...current, ...patch };
    localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(updated));
    return updated;
  },

  /** Award XP and handle level-up logic. Returns { user, leveledUp, newLevel } */
  async awardXP(amount, reason) {
    const user = JSON.parse(
      localStorage.getItem(`${DB_PREFIX}current_user`) || "{}"
    );
    const oldLevel = user.level || 1;
    const newXP = (user.xp || 0) + amount;
    // Level threshold: 100 XP per level (simple, satisfying)
    const newLevel = Math.floor(newXP / 100) + 1;
    const updated = {
      ...user,
      xp: newXP,
      level: newLevel,
    };
    const leveledUp = newLevel > oldLevel;
    if (leveledUp) {
      updated.badges = [
        ...(user.badges || []),
        { type: "level_up", level: newLevel, date: new Date().toISOString() },
      ];
    }
    localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(updated));
    return { user: updated, leveledUp, newLevel };
  },

  /** Update daily streak. Call once per day when rep logs activity. */
  async touchStreak() {
    const user = JSON.parse(
      localStorage.getItem(`${DB_PREFIX}current_user`) || "{}"
    );
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = user.last_active_date;

    if (lastActive === today) return user; // Already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    const newStreak = lastActive === yStr ? (user.streak_days || 0) + 1 : 1;
    const updated = {
      ...user,
      streak_days: newStreak,
      last_active_date: today,
    };
    localStorage.setItem(`${DB_PREFIX}current_user`, JSON.stringify(updated));
    return updated;
  },
};

/* ── Exported dataStore object ────────────────────────────────────── */

export const dataStore = {
  entities: {
    FieldLog: createEntityAPI("field_logs"),
    Roleplay: createEntityAPI("roleplays"),
    Objection: createEntityAPI("objections"),
    TrainingModule: createEntityAPI("training_modules"),
    Assignment: createEntityAPI("assignments"),
    Certification: createEntityAPI("certifications"),
    MeetingNote: createEntityAPI("meeting_notes"),
    ContentAsset: createEntityAPI("content_assets"),
    User: createEntityAPI("users"),
  },
  auth: authAPI,
};

/* ── Seed content on first run ────────────────────────────────────── */

import { seedObjections, seedModules, seedAssignments } from "@/content/seedData";

export function seedContentIfEmpty() {
  const objections = getAll("objections");
  if (objections.length === 0) {
    saveAll("objections", seedObjections.map((o) => ({
      ...o,
      id: genId(),
      created_date: new Date().toISOString(),
    })));
  }

  const modules = getAll("training_modules");
  if (modules.length === 0) {
    saveAll("training_modules", seedModules.map((m) => ({
      ...m,
      id: genId(),
      created_date: new Date().toISOString(),
    })));
  }

  const assignments = getAll("assignments");
  if (assignments.length === 0) {
    saveAll("assignments", []);
  }
}
