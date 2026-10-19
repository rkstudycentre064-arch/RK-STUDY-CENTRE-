import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Sparkles, 
  User, 
  LogIn, 
  ShieldCheck 
} from 'lucide-react';
import type { MainNavRoute, ClassLevel } from '../types';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentRoute: MainNavRoute;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel }) => void;
}

export function MobileBottomNav({ currentRoute, onNavigate }: MobileBottomNavProps) {
  const { user, isOwner } = useAuth();

  const navItems: Array<{
    id: string;
    route: MainNavRoute;
    label: string;
    icon: typeof Home;
    badge?: string;
    isActive: boolean;
  }> = [
    {
      id: 'mbn-home',
      route: 'home',
      label: 'होम',
      icon: Home,
      isActive: currentRoute === 'home',
    },
    {
      id: 'mbn-classes',
      route: 'classes',
      label: 'कक्षाएं',
      icon: GraduationCap,
      isActive: currentRoute === 'classes',
    },
    {
      id: 'mbn-notes',
      route: 'study-material',
      label: 'नोट्स',
      icon: BookOpen,
      isActive: currentRoute === 'study-material',
    },
    {
      id: 'mbn-tests',
      route: 'tests',
      label: 'टेस्ट',
      icon: Award,
      badge: 'LIVE',
      isActive: currentRoute === 'tests',
    },
    {
      id: 'mbn-doubt',
      route: 'solve-doubt',
      label: 'AI डाउट',
      icon: Sparkles,
      isActive: currentRoute === 'solve-doubt',
    },
    {
      id: 'mbn-profile',
      route: user ? 'login' : 'login',
      label: user ? (isOwner ? 'व्यवस्थापक' : 'प्रोफाइल') : 'लॉगिन',
      icon: user ? (isOwner ? ShieldCheck : User) : LogIn,
      isActive: currentRoute === 'login' || currentRoute === 'register' || currentRoute === 'owner',
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-6 items-center px-1 py-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.isActive;

          return (
            <button
              key={item.id}
              id={item.id}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer min-h-[52px] ${
                isItemActive 
                  ? 'text-blue-700 font-black' 
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              {/* Active top glow indicator dot */}
              {isItemActive && (
                <span className="absolute top-0.5 w-7 h-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-fade-in" />
              )}

              {/* Icon Container with Badge */}
              <div className={`relative p-1 rounded-lg transition-transform ${isItemActive ? 'scale-110 bg-blue-50/90 text-blue-700' : ''}`}>
                <Icon className={`w-5 h-5 ${isItemActive ? 'stroke-[2.5]' : 'stroke-2'}`} />

                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white font-black text-[9px] px-1 py-0.2 rounded-full leading-tight shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full ${
                isItemActive ? 'font-black text-blue-700' : 'font-semibold text-slate-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
