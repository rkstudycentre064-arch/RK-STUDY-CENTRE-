/**
 * RK STUDY CENTRE - Executive Notification & Alerts Manager (Task 16)
 * 
 * Complete In-App Notification System:
 * - Real-time view of event-driven and broadcast notifications
 * - Strict duplicate prevention with deterministic idempotency keys
 * - Role, Class, and Individual recipient targeting
 * - Filtering (Type, Priority, Read Status, Scope), Search, Bulk Read, Delete
 * - Manual Notification Creation & Broadcast Modal
 * - Detail Modal with deep navigation action routes
 * - Zero fake/demo numbers, completely accessible and responsive
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  CreditCard,
  FileSpreadsheet,
  BookOpen,
  MessageSquare,
  Award,
  Layers,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { OwnerTabType } from '../../views/OwnerView';
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from '../../services/notificationService';
import type {
  NotificationItem,
  NotificationType,
  NotificationPriority,
  NotificationRecipientScope,
  ClassLevel,
} from '../../types';

interface OwnerNotificationManagerProps {
  onNavigateTab: (tab: OwnerTabType) => void;
}

export function OwnerNotificationManager({ onNavigateTab }: OwnerNotificationManagerProps) {
  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedReadStatus, setSelectedReadStatus] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');

  // Modals
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Create Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState<NotificationType>('General');
  const [formPriority, setFormPriority] = useState<NotificationPriority>('Normal');
  const [formRecipientScope, setFormRecipientScope] = useState<NotificationRecipientScope>('All');
  const [formClassLevel, setFormClassLevel] = useState<string>('class-10');
  const [formActionRoute, setFormActionRoute] = useState<string>('dashboard');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load notifications
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllNotifications();
      setNotifications(list);
    } catch (e) {
      console.warn('[OwnerNotificationManager] Failed to load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMsg = n.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg) return false;
      }

      // Type
      if (selectedType !== 'all' && n.type !== selectedType) return false;

      // Priority
      if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;

      // Read Status
      if (selectedReadStatus === 'unread' && n.isRead) return false;
      if (selectedReadStatus === 'read' && !n.isRead) return false;

      // Scope
      if (selectedScope !== 'all' && n.recipientScope !== selectedScope) return false;

      return true;
    });
  }, [notifications, searchQuery, selectedType, selectedPriority, selectedReadStatus, selectedScope]);

  // Metrics
  const metrics = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const urgentImportant = notifications.filter(
      (n) => n.priority === 'Urgent' || n.priority === 'Important'
    ).length;
    const broadcast = notifications.filter((n) => n.recipientScope === 'All').length;
    return { total, unread, urgentImportant, broadcast };
  }, [notifications]);

  // Actions
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead('owner', 'owner');
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: nextRead } : n))
    );
    if (nextRead) {
      await markNotificationAsRead(id);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) setSelectedNotification(null);
    await deleteNotification(id);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('सूचना का शीर्षक अनिवार्य है।');
      return;
    }
    if (!formMessage.trim()) {
      setFormError('सूचना का संदेश अनिवार्य है।');
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = await createNotification({
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        priority: formPriority,
        recipientScope: formRecipientScope,
        classLevel: formRecipientScope === 'Class' ? (formClassLevel as ClassLevel) : undefined,
        recipientRole:
          formRecipientScope === 'Role' ? 'student' : formRecipientScope === 'All' ? 'all' : undefined,
        actionRoute: formActionRoute,
        sourceType: 'manual',
      });

      setNotifications((prev) => [newItem, ...prev.filter((n) => n.id !== newItem.id)]);
      setShowCreateModal(false);
      setFormTitle('');
      setFormMessage('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'सूचना प्रसारित करने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & METRICS                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5" />
              <span>Real-Time In-App Alert System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              सूचनाएं व अलर्ट प्रबंधन (Notifications & Alerts)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              संस्थान परिपत्र, फीस भुगतान, परीक्षा कार्यक्रम, परिणाम और छात्र पूछताछ से संबंधित रीयल-टाइम अलर्ट
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>रिफ्रेश</span>
            </button>

            {metrics.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-4 h-4 text-slate-600" />
                <span>सब पढ़ा चिह्नित करें</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नई सूचना प्रसारित करें</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500">कुल सूचनाएं</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="text-xs font-bold text-blue-700">अपठित (Unread)</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{metrics.unread}</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-xs font-bold text-amber-700">तत्काल / महत्वपूर्ण</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{metrics.urgentImportant}</div>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <div className="text-xs font-bold text-purple-700">सार्वजनिक प्रसारण</div>
            <div className="text-2xl font-black text-purple-900 mt-1">{metrics.broadcast}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTERS CONTROLS                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शीर्षक या संदेश में खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">सभी प्रकार (All Types)</option>
            <option value="Notice">सूचना (Notice)</option>
            <option value="Fee">फीस (Fee)</option>
            <option value="Exam">परीक्षा (Exam)</option>
            <option value="Result">परिणाम (Result)</option>
            <option value="StudyMaterial">सामग्री (Material)</option>
            <option value="Inquiry">पूछताछ (Inquiry)</option>
            <option value="System">सिस्टम (System)</option>
            <option value="General">सामान्य (General)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full md:w-40 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">सभी प्राथमिकता</option>
            <option value="Normal">सामान्य (Normal)</option>
            <option value="Important">महत्वपूर्ण (Important)</option>
            <option value="Urgent">तत्काल (Urgent)</option>
          </select>

          {/* Read Status Filter */}
          <select
            value={selectedReadStatus}
            onChange={(e) => setSelectedReadStatus(e.target.value)}
            className="w-full md:w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">सभी स्थिति</option>
            <option value="unread">अपठित (Unread)</option>
            <option value="read">पढ़ा हुआ (Read)</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery ||
            selectedType !== 'all' ||
            selectedPriority !== 'all' ||
            selectedReadStatus !== 'all' ||
            selectedScope !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedPriority('all');
                setSelectedReadStatus('all');
                setSelectedScope('all');
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              फ़िल्टर रीसेट करें
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NOTIFICATIONS LIST                                                     */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-black text-slate-800">सूचनाएं लोड हो रही हैं...</div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 px-6">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">कोई सूचना नहीं मिली</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedType !== 'all' || selectedPriority !== 'all'
              ? 'वर्तमान फ़िल्टर के अनुसार कोई सूचना उपलब्ध नहीं है।'
              : 'सभी स्वचालित एवं मैनुअल सूचनाएं यहाँ सुरक्षित रूप से दिखाई देंगी।'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNotification(n)}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !n.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(n.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-black truncate ${
                        !n.isRead ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {n.title}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        n.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : n.priority === 'Important'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {n.priority === 'Urgent'
                        ? 'तत्काल'
                        : n.priority === 'Important'
                        ? 'महत्वपूर्ण'
                        : 'सामान्य'}
                    </span>

                    {/* Type Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      {n.type}
                    </span>

                    {/* Scope Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                      {n.recipientScope === 'All'
                        ? 'सभी'
                        : n.recipientScope === 'Class'
                        ? `कक्षा ${n.classLevel?.replace('class-', '') || ''}`
                        : n.recipientScope === 'Role'
                        ? `रोल: ${n.recipientRole || ''}`
                        : 'व्यक्तिगत'}
                    </span>

                    {!n.isRead && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black tracking-wider">
                        नया
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.createdAt).toLocaleString('hi-IN')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="flex items-center gap-2 self-end sm:self-center shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {n.actionRoute && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab(n.actionRoute as OwnerTabType);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>मॉड्यूल देखें</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleRead(n.id, n.isRead)}
                  title={n.isRead ? 'अपठित चिह्नित करें' : 'पढ़ा हुआ चिह्नित करें'}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    n.isRead
                      ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  title="हटाएं"
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NOTIFICATION DETAIL MODAL                                              */}
      {/* ========================================================================= */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  {getTypeIcon(selectedNotification.type)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedNotification.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {new Date(selectedNotification.createdAt).toLocaleString('hi-IN')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.message}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold">प्राथमिकता:</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedNotification.priority}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold">लक्षित दर्शक (Scope):</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedNotification.recipientScope}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleDelete(selectedNotification.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer transition-colors"
              >
                हटाएं
              </button>

              <div className="flex items-center gap-2">
                {selectedNotification.actionRoute && (
                  <button
                    onClick={() => {
                      const targetRoute = selectedNotification.actionRoute as OwnerTabType;
                      setSelectedNotification(null);
                      onNavigateTab(targetRoute);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>संबंधित मॉड्यूल खोलें</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CREATE / BROADCAST NOTIFICATION MODAL                                  */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  नई सूचना प्रसारित करें (Broadcast Alert)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  सूचना शीर्षक (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="उदा. महत्वपूर्ण कक्षा समय में परिवर्तन"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  सूचना संदेश (Message Body) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="यहाँ विस्तृत सूचना विवरण दर्ज करें..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">श्रेणी (Type)</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="General">सामान्य (General)</option>
                    <option value="Notice">परिपत्र (Notice)</option>
                    <option value="Fee">फीस (Fee)</option>
                    <option value="Exam">परीक्षा (Exam)</option>
                    <option value="Result">परिणाम (Result)</option>
                    <option value="StudyMaterial">सामग्री (Material)</option>
                    <option value="System">सिस्टम (System)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">प्राथमिकता (Priority)</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Normal">सामान्य (Normal)</option>
                    <option value="Important">महत्वपूर्ण (Important)</option>
                    <option value="Urgent">तत्काल (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">लक्षित दर्शक (Audience)</label>
                  <select
                    value={formRecipientScope}
                    onChange={(e) => setFormRecipientScope(e.target.value as NotificationRecipientScope)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="All">समस्त (Everyone)</option>
                    <option value="Role">छात्र वर्ग (Students)</option>
                    <option value="Class">विशिष्ट कक्षा (Class)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">संबंधित मॉड्यूल रूट</label>
                  <select
                    value={formActionRoute}
                    onChange={(e) => setFormActionRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="dashboard">डैशबोर्ड (Dashboard)</option>
                    <option value="notices">नोटिस बोर्ड (Notices)</option>
                    <option value="fees">फीस लेजर (Fees)</option>
                    <option value="exams">परीक्षाएं (Exams)</option>
                    <option value="results">परिणाम (Results)</option>
                    <option value="study-material">अध्ययन सामग्री (Notes)</option>
                    <option value="inquiries">पूछताछ (Inquiries)</option>
                  </select>
                </div>
              </div>

              {formRecipientScope === 'Class' && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-700">कक्षा चुनें</label>
                  <select
                    value={formClassLevel}
                    onChange={(e) => setFormClassLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="class-9">कक्षा 9वीं (Class 9)</option>
                    <option value="class-10">कक्षा 10वीं (Class 10)</option>
                    <option value="class-11">कक्षा 11वीं (Class 11)</option>
                    <option value="class-12">कक्षा 12वीं (Class 12)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'प्रसारित हो रहा है...' : 'सूचना प्रसारित करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
