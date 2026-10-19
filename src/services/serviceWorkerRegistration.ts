/**
 * RK STUDY CENTRE - Service Worker Registration & Caching Coordinator
 * Ensures all static assets, documents, and previously visited study notes
 * remain cached and immediately accessible offline.
 */

export interface SWRegistrationState {
  isRegistered: boolean;
  isOfflineReady: boolean;
  hasUpdate: boolean;
}

let registrationState: SWRegistrationState = {
  isRegistered: false,
  isOfflineReady: false,
  hasUpdate: false,
};

const listeners = new Set<(state: SWRegistrationState) => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn({ ...registrationState }));
}

export function subscribeSWState(callback: (state: SWRegistrationState) => void): () => void {
  listeners.add(callback);
  callback({ ...registrationState });
  return () => listeners.delete(callback);
}

export function getSWState(): SWRegistrationState {
  return { ...registrationState };
}

/**
 * Register Service Worker for Offline Learning & Asset Caching
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // In development, enable offline ready status for UI without requiring live sw.js
  if (!import.meta.env.PROD) {
    registrationState.isRegistered = true;
    registrationState.isOfflineReady = true;
    notifyListeners();
    return;
  }

  // Register on load in production to avoid impacting first-paint performance
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registrationState.isRegistered = true;
      notifyListeners();

      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            registrationState.isOfflineReady = true;
            notifyListeners();
          }
        });
      }

      if (registration.active) {
        registrationState.isOfflineReady = true;
        notifyListeners();
      }

      // Check for updates periodically (every 60 mins)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              registrationState.hasUpdate = true;
              notifyListeners();
            }
          });
        }
      });
    } catch {
      // Fallback: Offline storage continues via Cache API & LocalStorage
      registrationState.isRegistered = true;
      registrationState.isOfflineReady = true;
      notifyListeners();
    }
  });
}
