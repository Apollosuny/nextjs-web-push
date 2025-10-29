'use server';

import webpush from 'web-push';

webpush.setVapidDetails(
  'https://nextjs-web-push-delta.vercel.app',
  'BAAeJB3fBTvI1atDsWQ36qKgnF8AACUK9w_cxH8MUWak4bKmBqKkhbC88D9THuap65S2RGz4_PkrljlyhyIX1oU',
  'Kb_me2j69SiDVoJdhM4vp5xg4XQpUbAW64OomLoZY_k'
);

export async function subscribeUser(_sub: PushSubscription) {
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: _sub })
  return { success: true };
}

export async function unsubscribeUser() {
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(
  message: string,
  subscriptionData: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
) {
  if (!subscriptionData) {
    throw new Error('No subscription available');
  }

  console.log('subscription', subscriptionData);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
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
