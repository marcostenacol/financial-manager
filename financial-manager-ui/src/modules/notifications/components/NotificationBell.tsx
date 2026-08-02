import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../../../shared/components/useToast';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const NotificationBell = () => {
  const { showToast } = useToast();
  const { notifications, loadNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     
    loadNotifications().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar notificações'), 'error'));
    const interval = setInterval(() => {
      loadNotifications().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar notificações'), 'error'));
    }, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const handleMarkAsRead = async (id: string) => {
    if (pendingIds.has(id)) return;

    setPendingIds((prev) => new Set(prev).add(id));
    try {
      await markAsRead(id);
      loadNotifications();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao marcar como lida'), 'error');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      loadNotifications();
    } catch (err) {
      showToast(getErrorMessage(err, 'Erro ao marcar todas como lidas'), 'error');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-sm font-bold text-white">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCheck className="w-3 h-3" />
                  Ler tudo
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 transition-colors relative group ${
                        !notification.readAt ? 'bg-blue-600/5' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                          notification.type === 'success' ? 'bg-emerald-500/10' :
                          notification.type === 'warning' ? 'bg-amber-500/10' :
                          notification.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                        }`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold truncate ${!notification.readAt ? 'text-white' : 'text-slate-300'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {!notification.readAt && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={pendingIds.has(notification.id)}
                              className="mt-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">Tudo em dia por aqui!</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
               <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                 Ver histórico completo
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
