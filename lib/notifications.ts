import {webpush} from 'web-push';

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:support@mees-ai.co.zw', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function sendNotification(subscription: PushSubscriptionData, message: string) {
  try {
    await webpush.sendNotification(subscription, message);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
} 