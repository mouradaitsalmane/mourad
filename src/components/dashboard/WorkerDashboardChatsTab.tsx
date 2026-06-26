import React from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface ChatRoom {
  id: string;
  taskTitle: string;
  taskId: string;
  otherPartyId: string;
  otherPartyName: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

interface WorkerDashboardChatsTabProps {
  lang: 'ar' | 'fr';
  isRTL: boolean;
  chatRooms: ChatRoom[];
  loadingChats: boolean;
  activeRoom: ChatRoom | null;
  setActiveRoom: (room: ChatRoom | null) => void;
  messages: ChatMessage[];
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  handleSendChatMessage: (e: React.FormEvent) => void;
  user: any;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function WorkerDashboardChatsTab({
  lang,
  isRTL,
  chatRooms,
  loadingChats,
  activeRoom,
  setActiveRoom,
  messages,
  newMessageText,
  setNewMessageText,
  handleSendChatMessage,
  user,
  chatEndRef
}: WorkerDashboardChatsTabProps) {
  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[550px] animate-fade-in" id="worker-tab-chats">
      
      {/* Chats Sidebar */}
      <div className="w-full md:w-80 border-r md:border-r-0 md:border-l border-gray-200 shrink-0 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-emerald-50/10">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 justify-end">
            <MessageCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span>{isRTL ? 'المحادثات والنقاشات النشطة مع أصحاب الطلب' : 'Messageries Actives Client'}</span>
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 max-h-[250px] md:max-h-[500px]">
          {loadingChats ? (
            <div className="p-4 text-center text-[10px] text-gray-400 animate-pulse">{isRTL ? 'مزامنة المحادثات الجارية...' : 'Chargement...'}</div>
          ) : chatRooms.length === 0 ? (
            <div className="py-12 p-4 text-center text-[10px] text-gray-400 font-bold leading-relaxed">
              {isRTL 
                ? 'لا توجد محادثات نشطة بعد. الترسيم يتم فور وضعك لعرض أسعار فني على أحد المهام.' 
                : 'Aucun message de négociation. Postez des propositions de devis.'}
            </div>
          ) : (
            chatRooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              return (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full p-4 rounded-xl text-right transition-all flex flex-col gap-1 cursor-pointer select-none ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                      : 'border border-transparent bg-white shadow-xs hover:bg-emerald-50/40'
                  }`}
                >
                  <span className={`text-[10px] font-black line-clamp-1 ${isActive ? 'text-emerald-100' : 'text-emerald-600'}`}>{room.taskTitle}</span>
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 justify-end ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    <span>{room.otherPartyName}</span>
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Pane */}
      <div className="flex-1 flex flex-col bg-white">
        {activeRoom ? (
          <>
            <div className="p-4.5 border-b border-gray-100 flex items-center justify-between flex-row bg-slate-50/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-black uppercase">
                  {isRTL ? 'مفاوضات أسعار' : 'Négociation'}
                </span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-slate-900">{activeRoom.otherPartyName}</span>
                <span className="text-[10px] text-slate-400 font-bold">{activeRoom.taskTitle}</span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-start max-h-[380px]">
              {messages.length === 0 ? (
                <div className="py-16 text-center text-[10px] text-gray-450 leading-relaxed font-bold">
                  {isRTL 
                    ? 'تفاوض بذكاء مع العميل! أثبت قدراتك المهنية وأرسل له تفاصيل خبرتك وسرعة وصولك.' 
                    : 'Proposez des détails supplémentaires, des images, etc.'}
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user.uid;
                  return (
                    <div 
                      key={m.id}
                      className={`flex flex-col max-w-[80%] gap-1 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <span className="text-[8px] text-gray-400 font-black px-1 leading-none">{m.senderName}</span>
                      <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-gray-800 rounded-tl-none border border-slate-150'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-100 bg-slate-550 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={isRTL ? 'اكتب رسالتك وسؤالك للعميل بوضوح هنا...' : 'Saisir votre message...'}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white"
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
            <MessageCircle className="w-12 h-12 text-slate-300 stroke-1.5" />
            <p className="text-xs font-bold text-gray-450 max-w-sm leading-relaxed">
              {isRTL 
                ? 'يرجى اختيار أحد غرف الدردشة النشطة للبدء الفوري في نقاش السعر مع العميل.' 
                : 'Sélectionnez un fil de discussion pour entamer les négociations directes.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
