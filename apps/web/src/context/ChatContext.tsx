
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';

interface Message {
  sender: string;
  userId: string;
  content: string;
  timestamp: string; // ISO
}

interface ChatContextType {
  isConnected: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socketInstance: Socket | null = null;
    let cancelled = false;

    const initSocket = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!session) return;

        // Connect to NestJS Gateway
        socketInstance = io('http://localhost:3000/chat', {
            extraHeaders: { Authorization: `Bearer ${session.access_token}` },
            query: { token: session.access_token } // Fallback
        });

        socketInstance.on('connect', () => {
            console.log('Chat Connected');
            if(!cancelled) setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Chat Disconnected');
            if(!cancelled) setIsConnected(false);
        });

        socketInstance.on('chat:broadcast', (msg: Message) => {
            if(!cancelled) setMessages(prev => [...prev, msg].slice(-50));
        });

        if(!cancelled) setSocket(socketInstance);
    };

    initSocket();

    return () => {
        cancelled = true;
        if (socketInstance) {
            socketInstance.disconnect();
        }
    };
  }, []);

  const sendMessage = (content: string) => {
    if (socket && isConnected) {
        socket.emit('chat:message', { content });
    }
  };

  return (
    <ChatContext.Provider value={{ isConnected, messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
