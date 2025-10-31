const firebaseConfig = {
  apiKey: "AIzaSyCjBnzkWdrc5Zssc9tNp54qJ3Kz0UfT8I4",
  authDomain: "alex-scripts-chat.firebaseapp.com",
  databaseURL: "https://alex-scripts-chat-default-rtdb.firebaseio.com",
  projectId: "alex-scripts-chat",
  storageBucket: "alex-scripts-chat.appspot.com",
  messagingSenderId: "97451950905",
  appId: "1:97451950905:web:2b28665927bb81d7e01ee8"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
