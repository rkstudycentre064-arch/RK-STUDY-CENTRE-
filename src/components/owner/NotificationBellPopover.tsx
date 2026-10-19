/**
 * RK STUDY CENTRE - Notification Bell & Quick Popover Component (Task 16)
 * 
 * Header Notification Bell:
 * - Live unread badge count (with '99+' handling)
 * - Click outside & Escape key dismiss
 * - Mark individual/all as read with immediate optimistic UI
 * - Direct deep-link to Owner Notification Management Tab
 * - Full ARIA keyboard accessibility and 44px+ touch target
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Trash2,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  CreditCard,
  FileSpreadsheet,
  BookOpen,
  MessageSquare,
  Award,
  Layers,
} from 'lucide-react';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../services/notificationService';
import type { NotificationItem, NotificationType } from '../../types';
import type { OwnerTabType } from '../../views/OwnerView';

interface NotificationBellPopoverProps {
  onNavigateTab: (tab: OwnerTabType) => void;
}

export function NotificationBellPopover({ onNavigateTab }: NotificationBellPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllNotifications();
      setNotifications(list);
    } catch (e) {
      console.warn('[NotificationBellPopover] Error loading notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead('owner', 'owner');
  };

  const handleMarkOneRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsRead(id);
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  };

  const handleItemClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      handleMarkOneRead(n.id);
    }
    setIsOpen(false);
    if (n.actionRoute) {
      onNavigateTab(n.actionRoute as OwnerTabType);
    } else {
      onNavigateTab('notifications');
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'Notice':
        return <Bell className="w-4 h-4 text-rose-600" />;
      case 'Fee':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'Exam':
        return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
      case 'Result':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'StudyMaterial':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'Inquiry':
        return <MessageSquare className="w-4 h-4 text-blue-700" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Bell Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications();
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`सूचनाएं (${unreadCount} नई सूचनाएं)`}
        className="relative inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs ring-2 ring-white animate-in zoom-in-75">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="सूचनाएं सूची"
          className="absolute right-0 sm:right-auto sm:left-auto mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">सूचनाएं व अलर्ट</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  {unreadCount} नई
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>सब पढ़ा चिह्नित करें</span>
              </button>
            )}
          </div>

          {/* Body / List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-10 text-center text-xs font-bold text-slate-400">
                सूचनाएं लोड हो रही हैं...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-700">कोई नई सूचना नहीं है</div>
                <p className="text-[11px] text-slate-400 font-medium">
                  सभी संस्थान सूचनाएं और अलर्ट यहाँ दिखाई देंगे।
                </p>
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-black truncate ${
                          !n.isRead ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(n.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </span>

                      <div className="flex items-center gap-2">
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkOneRead(n.id, e)}
                            title="पढ़ा हुआ चिह्नित करें"
                            className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteOne(n.id, e)}
                          title="हटाएं"
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: View All Button */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('notifications');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>सभी सूचनाएं प्रबंधित करें</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
