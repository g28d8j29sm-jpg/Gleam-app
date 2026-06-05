import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAILY_REMINDER_ID = 'gleam-daily-reminder';

const MESSAGES = [
  { title: '🧠 Il est temps d\'apprendre !', body: 'Quelques minutes suffisent pour progresser aujourd\'hui.' },
  { title: '🔥 Maintenez votre série !', body: 'Ne laissez pas votre streak s\'interrompre. Apprenez maintenant !' },
  { title: '💬 Nouveau défi vous attend', body: 'Un scénario de pratique vous attend sur Gleam.' },
  { title: '📈 Votre potentiel ne attend pas', body: 'Développez votre intelligence sociale aujourd\'hui.' },
  { title: '✨ Gleam vous appelle !', body: 'Continuez votre parcours vers l\'excellence sociale.' },
];

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Gleam',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour = 9, minute = 0) {
  await cancelDailyReminder();

  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return true;
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}

export async function sendImmediateNotification(title, body) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}
