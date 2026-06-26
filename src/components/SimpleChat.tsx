import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { subscribeToRoomMessages, sendMessageService } from '../services/chatService';
import { MessageSquare, Send, X, Clock, User } from 'lucide-react';

interface SimpleChatProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  recipientId: string;
  recipientName: string;
  lang: 'ar' | 'fr';
  title?: string;
  onClose?: () => void;
}

export default function SimpleChat({
  roomId,
  currentUserId,
  currentUserName,
  recipientId,
  recipientName,
  lang,
  title,
  onClose
}: SimpleChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'ar';

  // Subscribing to instant real-time message stream
  useEffect(() => {
    const unsub = subscribeToRoomMessages(
      roomId,
      (list) => {
        setMessages(list);
        scrollToBottom();
      },
      (err) => {
        setError(isRTL ? 'فشل تحميل الرسائل المباشرة.' : 'Impossible de charger la messagerie.');
      }
    );
    return () => unsub();
  }, [roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim().length === 0 || loading) return;

    const messageText = inputText.trim();
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      await sendMessageService({
        roomId,
        senderId: currentUserId,
        senderName: currentUserName,
        text: messageText
      });
      scrollToBottom();
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(isRTL ? 'فشل في إرسال الرسالة. يرجى المحاولة مجدداً.' : "Échec de l'envoi de votre message.");
      setInputText(messageText); // restore text
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (createdAt: any) => {
    if (!createdAt) return '';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div 
      id={`chat-box-${roomId}`}
      className="bg-slate-50 rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col h-[400px] shadow-xs"
    >
      {/* Header bar */}
      <div className="bg-sky-600 px-4 py-3 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              {isRTL ? 'محادثة مباشرة' : 'Chat direct'}
            </span>
            <span className="text-xs font-black truncate max-w-[180px]">
              {title || recipientName}
            </span>
          </div>
        </div>

        {onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-xs font-semibold text-center mt-1">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-1.5 p-4">
            <MessageSquare className="w-8 h-8 text-gray-300 animate-pulse" />
            <p className="text-xs font-bold">
              {isRTL 
                ? 'لا توجد رسائل بعد. ابدأ بالتواصل الآمن داخل المنصة!' 
                : 'Aucun message. Commencez à échanger en toute sécurité !'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div 
                key={msg.id || idx}
                className={`flex flex-col max-w-[80%] ${isMe ? 'self-start' : 'self-end'}`}
              >
                <div 
                  className={`px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-3xs ${
                    isMe 
                      ? 'bg-sky-600 text-white rounded-tl-none rounded-br-2xl' 
                      : 'bg-white text-gray-800 border border-gray-150 rounded-tr-none rounded-bl-2xl'
                  }`}
                >
                  <p className="whitespace-pre-wrap breakdown-words">{msg.text}</p>
                </div>
                <span className="text-[9px] text-gray-400 font-bold mt-1 px-1 flex items-center gap-0.5 self-end">
                  <Clock className="w-2.5 h-2.5 text-gray-300" />
                  <span>{formatTime(msg.createdAt)}</span>
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRTL ? 'اكتب رسالتك وتواصل فوراً...' : 'Votre message...'}
          className="flex-1 text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500 text-gray-800 font-bold bg-slate-50"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={inputText.trim().length === 0 || loading}
          className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          <Send className={`w-4 h-4 transform ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </div>
  );
}
