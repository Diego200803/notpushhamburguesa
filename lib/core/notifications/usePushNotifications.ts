import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../supabase/client.supabase';
import { NotificationAdapter } from './notification.adapter';

NotificationAdapter.setup();

export const usePushNotifications = (userId?: string) => {
  useEffect(() => {
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('ℹ️ Notificaciones push remotas deshabilitadas en Expo Go. Las locales sí funcionan.');
      return;
    }
    
    if (!userId) return;

    const register = async () => {
      const token = await NotificationAdapter.registerForPushNotificationsAsync();
      
      if (token) {
        console.log('✅ Token obtenido:', token);
        await saveTokenToDatabase(token, userId);
      }
    };

    register();
    
  }, [userId]);
};

async function saveTokenToDatabase(token: string, userId: string) {
  const { error } = await supabase
    .from('devices')
    .upsert({ 
      user_id: userId,
      token: token,
      platform: Platform.OS,
      last_used_at: new Date().toISOString()
    }, { onConflict: 'token' });

  if (error) {
    console.error('❌ Error guardando device:', error);
  } else {
    console.log('✅ Dispositivo registrado en Supabase');
  }
}