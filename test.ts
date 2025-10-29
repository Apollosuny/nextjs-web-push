import webpush from 'web-push';

const vapid = webpush.generateVAPIDKeys();

console.log(vapid);
