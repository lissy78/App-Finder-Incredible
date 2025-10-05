import { useState, useEffect, useRef, useCallback } from 'react';

const YUMBO_CENTER = { lat: 3.5836, lng: -76.4951 };

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
  speed?: number | null;
  heading?: number | null;
}

export interface LocationState {
  location: LocationData | null;
  error: string | null;
  isTracking: boolean;
  permissionState: 'unknown' | 'granted' | 'denied' | 'prompt';
  lastUpdate: Date | null;
}

export function useRealTimeLocation(enableTracking: boolean = true) {
  const [state, setState] = useState<LocationState>({
    location: YUMBO_CENTER as LocationData, // Empezar con Yumbo como fallback
    error: null,
    isTracking: false,
    permissionState: 'unknown',
    lastUpdate: null
  });

  const watchIdRef = useRef<number | null>(null);
  const requestInProgressRef = useRef(false);

  // Función para solicitar permisos y comenzar tracking
  const requestLocation = useCallback(async () => {
    if (requestInProgressRef.current) {
      console.log('🗺️ Location request already in progress, skipping...');
      return;
    }

    requestInProgressRef.current = true;

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Tu navegador no soporta geolocalización',
        permissionState: 'denied',
        location: YUMBO_CENTER as LocationData
      }));
      requestInProgressRef.current = false;
      return;
    }

    // Verificar el estado de los permisos primero
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        console.log('🗺️ Permission state:', permission.state);
        
        setState(prev => ({
          ...prev,
          permissionState: permission.state as any
        }));

        // Escuchar cambios en los permisos
        permission.onchange = () => {
          console.log('🗺️ Permission changed to:', permission.state);
          setState(prev => ({
            ...prev,
            permissionState: permission.state as any
          }));
        };
      }
    } catch (error) {
      console.log('🗺️ Permissions API not available:', error);
    }

    requestInProgressRef.current = false;
  }, []);

  // Función para iniciar el tracking en tiempo real
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.log('🗺️ Geolocation not available');
      return;
    }

    if (watchIdRef.current !== null) {
      console.log('🗺️ Already tracking, stopping previous watch');
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    console.log('🗺️ Starting real-time location tracking...');

    setState(prev => ({ ...prev, isTracking: true }));

    // Usar watchPosition para tracking continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed,
          heading: position.coords.heading
        };

        console.log('🗺️ Location updated:', {
          lat: locationData.lat.toFixed(6),
          lng: locationData.lng.toFixed(6),
          accuracy: `${locationData.accuracy?.toFixed(0)}m`,
          timestamp: new Date(position.timestamp).toLocaleTimeString()
        });

        setState(prev => ({
          ...prev,
          location: locationData,
          error: null,
          permissionState: 'granted',
          lastUpdate: new Date(),
          isTracking: true
        }));
      },
      (error) => {
        let errorMessage = 'Error de ubicación';
        let permissionState: 'denied' | 'unknown' = 'unknown';
        
        // Manejar error específico de policy
        if (error.message && error.message.includes('permissions policy')) {
          errorMessage = '📍 La geolocalización ha sido deshabilitada por la política de permisos del navegador. Usando ubicación predeterminada de Yumbo.';
          permissionState = 'denied';
        } else {
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = '📍 Permisos de ubicación denegados. Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
              permissionState = 'denied';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = '📍 Ubicación GPS no disponible. Verifica tu conexión y configuración.';
              break;
            case 3: // TIMEOUT
              errorMessage = '⏱️ Tiempo de espera agotado. Intenta nuevamente.';
              break;
            default:
              errorMessage = `⚠️ Error: ${error.message || 'Error desconocido'}`;
          }
        }

        console.log('🗺️ Geolocation error:', {
          code: error.code,
          message: error.message,
          errorType: error.code === 1 ? 'PERMISSION_DENIED' : 
                     error.code === 2 ? 'POSITION_UNAVAILABLE' : 
                     error.code === 3 ? 'TIMEOUT' : 'UNKNOWN',
          isPolicyError: error.message?.includes('permissions policy') || false,
          fallbackLocation: 'Yumbo (3.5836, -76.4951)'
        });

        setState(prev => ({
          ...prev,
          error: errorMessage,
          permissionState: permissionState,
          location: YUMBO_CENTER as LocationData, // Fallback a Yumbo
          isTracking: false
        }));

        // Limpiar el watch en caso de error
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true, // Usar GPS de alta precisión
        timeout: 10000, // 10 segundos de timeout
        maximumAge: 0 // Siempre obtener posición fresca, no usar caché
      }
    );
  }, []);

  // Función para detener el tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('🗺️ Stopping location tracking');
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, []);

  // Efecto para iniciar/detener tracking basado en enableTracking
  useEffect(() => {
    if (enableTracking) {
      requestLocation().then(() => {
        // Pequeño delay para dar tiempo a que se verifiquen los permisos
        setTimeout(() => {
          startTracking();
        }, 100);
      });
    } else {
      stopTracking();
    }

    // Cleanup al desmontar
    return () => {
      stopTracking();
    };
  }, [enableTracking, requestLocation, startTracking, stopTracking]);

  return {
    ...state,
    requestLocation,
    startTracking,
    stopTracking
  };
}
