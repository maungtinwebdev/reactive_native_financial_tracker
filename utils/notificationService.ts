import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Requests permissions for notifications and sets up Android channels if needed.
 * Returns true if permissions are granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3b5998',
        });
    }

    return true;
}

/**
 * Schedules a daily notification at the specified hour and minute.
 */
export async function scheduleDailyReminder(hour: number = 20, minute: number = 0) {
    // Clear any existing notifications first so we don't have duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Daily Finance Check-in 📉",
            body: "Don't forget to record today's expenses and income!",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: 'reminders', // Only used on Android
        },
    });

    return id;
}

/**
 * Checks if there are any scheduled reminders and returns their time
 */
export async function checkDailyReminderStatus(): Promise<{ enabled: boolean; hour: number; minute: number }> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    if (scheduledNotifications.length > 0) {
        const trigger = scheduledNotifications[0].trigger as any;
        if (trigger && trigger.type === Notifications.SchedulableTriggerInputTypes.DAILY) {
            return {
                enabled: true,
                hour: trigger.hour ?? 20,
                minute: trigger.minute ?? 0,
            };
        }
        return { enabled: true, hour: 20, minute: 0 };
    }

    return { enabled: false, hour: 20, minute: 0 };
}

/**
 * Cancels all scheduled reminders
 */
export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
