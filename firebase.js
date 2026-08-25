import { initializeApp } from 
"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { getAuth } from 
"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyBOYJbb383PFPbIAQOhPRKKlQXiPaNqxmE",
    authDomain: "yar-community-6ef3a.firebaseapp.com",
    projectId: "yar-community-6ef3a",
    storageBucket: "yar-community-6ef3a.firebasestorage.app",
    messagingSenderId: "733256836357",
    appId: "1:733256836357:web:45fbc7973bc8af41b1436c",
    measurementId: "G-2E8VJ18K8G"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


export {
    db,
    auth
};
