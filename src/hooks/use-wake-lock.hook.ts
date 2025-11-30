import { useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer le Screen Wake Lock API
 * Empêche l'écran de se verrouiller automatiquement
 *
 * @param enabled - Active ou désactive le wake lock
 * @returns Un objet avec l'état du wake lock et les méthodes de contrôle
 */
export const useWakeLock = (enabled: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Vérifier si l'API est disponible
    if (!('wakeLock' in navigator)) {
      // L'API n'est pas supportée, on ne fait rien
      return;
    }

    const requestWakeLock = async () => {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = wakeLock;

        // Gérer la libération automatique du wake lock (par exemple,
        // quand l'onglet devient invisible)
        wakeLock.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (error) {
        // Erreur lors de la demande du wake lock
        // Peut arriver si l'utilisateur refuse la permission ou si l'API n'est pas disponible
        console.warn("Impossible d'activer le wake lock:", error);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (error) {
          console.warn('Impossible de libérer le wake lock:', error);
        }
      }
    };

    if (enabled) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      requestWakeLock();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      releaseWakeLock();
    }

    // Nettoyer lors du démontage du composant
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      releaseWakeLock();
    };
  }, [enabled]);

  // Réactiver le wake lock si l'onglet redevient visible et que enabled est true
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        try {
          const wakeLock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = wakeLock;
        } catch (error) {
          console.warn('Impossible de réactiver le wake lock:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
};
