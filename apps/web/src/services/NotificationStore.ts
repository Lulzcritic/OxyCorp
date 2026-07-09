/**
 * Notification Store
 * 
 * Zustand store for managing in-game HUD notifications.
 * Supports timed auto-dismiss and stacking multiple notifications.
 */

import { create } from 'zustand';

export interface GameNotification {
  id: string;
  type: 'quest_complete' | 'quest_accepted' | 'reward' | 'info';
  title: string;
  message: string;
  color?: string;
  icon?: string;
  /** Timestamp when the notification was created */
  createdAt: number;
  /** Duration in ms before auto-dismiss (default 5000) */
  duration?: number;
}

interface NotificationState {
  notifications: GameNotification[];
  push: (notif: Omit<GameNotification, 'id' | 'createdAt'>) => void;
  dismiss: (id: string) => void;
}

let notifCounter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  push: (notif) => {
    const id = `notif_${Date.now()}_${notifCounter++}`;
    const entry: GameNotification = {
      ...notif,
      id,
      createdAt: Date.now(),
      duration: notif.duration ?? 5000,
    };

    set((state) => ({
      notifications: [...state.notifications, entry],
    }));

    // Auto-dismiss after duration
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, entry.duration);
  },

  dismiss: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
