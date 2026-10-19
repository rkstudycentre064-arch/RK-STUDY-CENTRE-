import { useState, useEffect, useCallback } from 'react';

export type NetworkSpeedTier = 'fast' | 'moderate' | 'weak' | 'offline';

export interface NetworkQualityState {
  isOnline: boolean;
  isWeak: boolean;
  effectiveType: string;
  rtt: number | null;
  downlink: number | null;
  saveData: boolean;
  tier: NetworkSpeedTier;
  simulatedWeakMode: boolean;
  lastLatencyMs: number | null;
  checkLatency: () => Promise<number | null>;
  toggleSimulatedWeakMode: () => void;
}

interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export function useNetworkQuality(): NetworkQualityState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [rtt, setRtt] = useState<number | null>(null);
  const [downlink, setDownlink] = useState<number | null>(null);
  const [saveData, setSaveData] = useState<boolean>(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [simulatedWeakMode, setSimulatedWeakMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rk_simulate_weak_network') === 'true';
    } catch {
      return false;
    }
  });

  const updateConnectionInfo = useCallback(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    setIsOnline(navigator.onLine);

    if (conn) {
      if (conn.effectiveType) setEffectiveType(conn.effectiveType);
      if (typeof conn.rtt === 'number') setRtt(conn.rtt);
      if (typeof conn.downlink === 'number') setDownlink(conn.downlink);
      if (typeof conn.saveData === 'boolean') setSaveData(conn.saveData);
    }
  }, []);

  const checkLatency = useCallback(async (): Promise<number | null> => {
    if (!navigator.onLine) {
      setLastLatencyMs(null);
      return null;
    }
    const start = performance.now();
    try {
      // Lightweight cache-busted fetch to test ping response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      await fetch(`/vite.svg?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - start);
      setLastLatencyMs(latency);
      return latency;
    } catch {
      const highLatency = 2500;
      setLastLatencyMs(highLatency);
      return highLatency;
    }
  }, []);

  useEffect(() => {
    updateConnectionInfo();

    const handleOnline = () => {
      setIsOnline(true);
      updateConnectionInfo();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateConnectionInfo();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateConnectionInfo);
    }

    // Optional subtle latency test
    const timer = setInterval(() => {
      if (navigator.onLine && !simulatedWeakMode) {
        checkLatency().catch(() => {});
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', updateConnectionInfo);
      }
      clearInterval(timer);
    };
  }, [updateConnectionInfo, checkLatency, simulatedWeakMode]);

  const toggleSimulatedWeakMode = useCallback(() => {
    setSimulatedWeakMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rk_simulate_weak_network', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Compute speed tier
  let tier: NetworkSpeedTier = 'fast';
  if (!isOnline) {
    tier = 'offline';
  } else if (simulatedWeakMode) {
    tier = 'weak';
  } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    tier = 'weak';
  } else if ((rtt !== null && rtt > 1200) || (downlink !== null && downlink < 0.4) || (lastLatencyMs !== null && lastLatencyMs > 1500)) {
    tier = 'weak';
  } else if (effectiveType === '3g' || (rtt !== null && rtt > 500) || (downlink !== null && downlink < 1.5)) {
    tier = 'moderate';
  } else {
    tier = 'fast';
  }

  const isWeak = tier === 'weak' || tier === 'offline' || simulatedWeakMode;

  return {
    isOnline,
    isWeak,
    effectiveType,
    rtt,
    downlink,
    saveData,
    tier,
    simulatedWeakMode,
    lastLatencyMs,
    checkLatency,
    toggleSimulatedWeakMode,
  };
}
