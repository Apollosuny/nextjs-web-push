'use server';

import webpush from 'web-push';

webpush.setVapidDetails(
  'https://nextjs-web-push-delta.vercel.app',
  'BAAeJB3fBTvI1atDsWQ36qKgnF8AACUK9w_cxH8MUWak4bKmBqKkhbC88D9THuap65S2RGz4_PkrljlyhyIX1oU',
  'Kb_me2j69SiDVoJdhM4vp5xg4XQpUbAW64OomLoZY_k'
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available');
  }

  console.log('subscription', subscription);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey('p256dh')!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))
          ),
        },
      },
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}
