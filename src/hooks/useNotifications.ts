import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/notifications');

    socket.onopen = () => {
      console.log('Connected to notifications WebSocket');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'newNotification') {
          setNotifications(prev => [data.data, ...prev]);
        } else if (data.event === 'notificationRead') {
          setNotifications(prev => prev.map(n => n.id === data.data.notificationId ? { ...n, read: true } : n));
        } else if (data.event === 'allNotificationsRead') {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      } catch (e) {
        console.error('Failed to parse notification message', e);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from notifications WebSocket');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const markAsRead = useCallback((id: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'markAsRead', data: { notificationId: id } }));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }, [ws]);

  const markAllAsRead = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'markAllAsRead' }));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [ws]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
