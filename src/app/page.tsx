'use client';

import { useState, useEffect } from 'react';
import { sendNotification, subscribeUser, unsubscribeUser } from './actions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setTimeout(() => setIsSupported(true), 0);
      registerServiceWorker();
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BAAeJB3fBTvI1atDsWQ36qKgnF8AACUK9w_cxH8MUWak4bKmBqKkhbC88D9THuap65S2RGz4_PkrljlyhyIX1oU'
        ),
      });

      await subscribeUser(sub);
      setSubscription(sub);
      setIsSubscribed(true);
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeUser();
        setSubscription(null);
        setIsSubscribed(false);
        console.log('Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const result = await sendNotification(message);
      if (result.success) {
        setMessage('');
        alert('Notification sent successfully!');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  if (!isSupported) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            Push Notifications Not Supported
          </h1>
          <p className='text-gray-600'>
            Your browser doesn&apos;t support push notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-center text-gray-800 mb-6'>
          Web Push Notifications Demo
        </h1>

        <div className='space-y-4'>
          <div className='text-center'>
            <p className='text-sm text-gray-600 mb-4'>
              Status: {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </p>

            {!isSubscribed ? (
              <button
                onClick={subscribeToPush}
                className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
              >
                Subscribe to Notifications
              </button>
            ) : (
              <button
                onClick={unsubscribeFromPush}
                className='w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
              >
                Unsubscribe from Notifications
              </button>
            )}
          </div>

          {isSubscribed && (
            <div className='border-t pt-4'>
              <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                Send Test Notification
              </h2>
              <div className='space-y-3'>
                <input
                  type='text'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Enter notification message...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button
                  onClick={sendTestNotification}
                  className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded'
                >
                  Send Notification
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='mt-6 text-xs text-gray-500 text-center'>
          <p>Make sure to allow notifications when prompted by your browser.</p>
        </div>
      </div>
    </div>
  );
}
