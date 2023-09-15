import { initializeApp } from 'firebase/app'
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDBDn1EuQyqkj6bvZVsn7p7JpSRH4UdQ3Y",
  authDomain: "task-manager-92183.firebaseapp.com",
  projectId: "task-manager-92183",
  storageBucket: "task-manager-92183.appspot.com",
  messagingSenderId: "505968055854",
  appId: "1:505968055854:web:04ba0481d9f987a422f1bf"
};

// Initialize Firebase and Firebase Authentication
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// // Get a reference to the messaging service
// const messaging = firebase.messaging();

// // Function to send a notification to a user
// const sendNotification = (recipientUserId, notificationData) => {
//   // Construct the notification message
//   const message = {
//     data: {
//       ...notificationData,
//     },
//     token: recipientUserId, // You may need to adjust this based on your recipient identification method
//   };

//   // Send the notification
//   messaging
//     .send(message)
//     .then(() => {
//       console.log('Notification sent successfully');
//     })
//     .catch((error) => {
//       console.error('Error sending notification:', error);
//     });
// };

export const db = getFirestore(app)
// export {auth , sendNotification }
export {auth}

