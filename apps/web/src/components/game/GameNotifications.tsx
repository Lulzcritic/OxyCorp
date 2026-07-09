/**
 * GameNotifications
 * 
 * Renders a stack of timed toast-style notifications in the top-center of the HUD.
 * Used for quest completions, rewards, and system messages.
 */

import { useNotificationStore } from '../../services/NotificationStore';
import type { GameNotification } from '../../services/NotificationStore';

const TYPE_STYLES: Record<string, { border: string; glow: string; icon: string }> = {
  quest_complete: { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.25)', icon: '✅' },
  quest_accepted: { border: '#00F3FF', glow: 'rgba(0, 243, 255, 0.25)', icon: '📋' },
  reward: { border: '#00FF9D', glow: 'rgba(0, 255, 157, 0.25)', icon: '🎁' },
  info: { border: '#888', glow: 'rgba(136, 136, 136, 0.15)', icon: 'ℹ️' },
};

function NotificationToast({ notif }: { notif: GameNotification }) {
  const dismiss = useNotificationStore((s) => s.dismiss);
  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
  const borderColor = notif.color || style.border;

  // Calculate remaining opacity for fade-out animation
  const age = Date.now() - notif.createdAt;
  const duration = notif.duration || 5000;
  const isFading = age > duration - 800;

  return (
    <div
      onClick={() => dismiss(notif.id)}
      style={{
        background: 'rgba(7, 7, 8, 0.95)',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 20px ${style.glow}, inset 0 0 30px rgba(0,0,0,0.5)`,
        padding: '14px 20px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        maxWidth: '500px',
        minWidth: '320px',
        opacity: isFading ? 0.5 : 1,
        transition: 'opacity 0.8s ease-out, transform 0.3s ease-out',
        animation: 'notifSlideIn 0.3s ease-out',
        pointerEvents: 'auto' as const,
      }}
    >
      <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>
        {notif.icon || style.icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          color: borderColor,
          fontWeight: 'bold',
          fontSize: '0.85rem',
          letterSpacing: '0.08em',
          textShadow: `0 0 6px ${borderColor}40`,
          marginBottom: '4px',
        }}>
          {notif.title.toUpperCase()}
        </div>
        <div style={{
          color: '#D1D5DB',
          fontSize: '0.85rem',
          lineHeight: '1.4',
        }}>
          {notif.message}
        </div>
      </div>
    </div>
  );
}

export default function GameNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Inject keyframe animation */}
      <style>{`
        @keyframes notifSlideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      >
        {notifications.map((notif) => (
          <NotificationToast key={notif.id} notif={notif} />
        ))}
      </div>
    </>
  );
}
