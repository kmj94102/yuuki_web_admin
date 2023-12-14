import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, Timestamp, doc, deleteDoc, collection, addDoc, getDocs, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const COLLECTION_IMAGE = "images"
const COLLECTION_VIDEO = "video"
const COLLECTION_SHORTS = "shorts"

const firebaseConfig = {
    apiKey: "AIzaSyCM6yHZgLAAVMDFBXtnxepM8u-UJsKpS7I",
    authDomain: "ezenbank.firebaseapp.com",
    databaseURL: "https://ezenbank.firebaseio.com",
    projectId: "ezenbank",
    storageBucket: "ezenbank.appspot.com",
    messagingSenderId: "257080629676",
    appId: "1:257080629676:web:5ba952820254217a964209"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();

export function getUser() {
  return auth.currentUser;
}

export function signOut() {
  return auth.signOut();
}

export function initSetting() {
  setPersistence(auth, browserSessionPersistence)
  .then(() => {
    return true;
  })
  .catch((error) => {
    console.log(error);
    return false;
  });
}

export async function emailLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    alert("login failuter\n" + error);
    return null;
  }
}

window.onload = function() {
  const loginButton = document.getElementById('login');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("사용자가 로그인되어 있습니다.");
      loginButton.textContent = "こんばんは~ ゆうきさん 👋🏻"
      loginButton.addEventListener('click', () => {
        signOut();
      });
    } else {
      console.log("사용자가 로그인되어 있지 않습니다.");
      loginButton.textContent = "Login";
      loginButton.addEventListener('click', () => {
        window.location.href = "login/login.html";
      });
    }
  });
}

export function videoInsert(address) {
  return new Promise((resolve, reject) => {
      addDoc(collection(db, COLLECTION_VIDEO), {
        address: address,
        order: 999,
        timestamp: Timestamp.fromDate(new Date())
      })
    .then((docRef) => {
      resolve(docRef.id);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export async function updateVideo(documentId, value) {
  const ref = doc(db, COLLECTION_VIDEO, documentId);

  await updateDoc(ref, {
    order: value
  });
}

export async function fetchImages() {
  const imagesRef = collection(db, COLLECTION_IMAGE);
  const imageSnapshot = await getDocs(query(imagesRef, orderBy('order', 'asc')));
  const imageList = imageSnapshot.docs.map(doc => ({
    documentId: doc.id, // 문서의 ID를 포함시킴
    ...doc.data() // 기존 데이터를 포함시킴
  }));

  return imageList;
}

async function imageInsert(address) {
  return await addDoc(collection(db, COLLECTION_IMAGE), {
    address: address,
    timestamp: Timestamp.fromDate(new Date()),
    order: 9999
  })
}

export async function deleteImage(documentId) {
  await deleteDoc(doc(db, COLLECTION_IMAGE, documentId));
}

export async function updateImage(documentId, value) {
  const ref = doc(db, COLLECTION_IMAGE, documentId);

  await updateDoc(ref, {
    order: value
  });
}

export async function uploadImage(file) {
  const storageRef = ref(storage, `${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
      },
      (error) => {
        console.error(error);
        reject("등록 실패");
      },
      async () => {
        console.log('File uploaded successfully');

        try {
          // 업로드 완료 후 이미지의 다운로드 URL을 가져오기
          const downloadURL = await getDownloadURL(storageRef);
          const document = await imageInsert(downloadURL)
          resolve([downloadURL, document.id]); // 다운로드 URL 반환
        } catch (error) {
          console.error('다운로드 URL 가져오기 실패:', error);
          reject("등록 실패");
        }
      }
    );
  });
}


export async function fetchVideos() {
  const videosRef = collection(db, COLLECTION_VIDEO);
  const videoSnapshot = await getDocs(query(videosRef, orderBy('order', 'asc')));
  const videoList = videoSnapshot.docs.map(doc => ({
    documentId: doc.id, // 문서의 ID를 포함시킴
    ...doc.data() // 기존 데이터를 포함시킴
  }));

  return videoList;
}

export async function deleteVideo(documentId) {
  await deleteDoc(doc(db, COLLECTION_VIDEO, documentId));
}

export async function fetchShorts() {
  const shortsRef = collection(db, COLLECTION_SHORTS);
  const shortsSnapshot = await getDocs(query(shortsRef, orderBy('order', 'asc')));
  const shortsList = shortsSnapshot.docs.map(doc => ({
    documentId: doc.id, // 문서의 ID를 포함시킴
    ...doc.data() // 기존 데이터를 포함시킴
  }));

  return shortsList;
}

export function shortsInsert(address) {
  return new Promise((resolve, reject) => {
      addDoc(collection(db, COLLECTION_SHORTS), {
      address: address,
      order: 999,
      timestamp: Timestamp.fromDate(new Date())
    })
    .then((docRef) => {
      resolve(docRef.id);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export async function updateShorts(documentId, value) {
  const ref = doc(db, COLLECTION_SHORTS, documentId);

  await updateDoc(ref, {
    order: value
  });
}

export async function deleteShorts(documentId) {
  console.log(COLLECTION_SHORTS + ' / ' + documentId)
  await deleteDoc(doc(db, COLLECTION_SHORTS, documentId));
}

export function showLoading() {
  document.querySelector('.loading').style.display = 'block';
}

export function hideLoading() {
  document.querySelector('.loading').style.display = 'none';
}