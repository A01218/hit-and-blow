import './styles/main.css';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, push, update, query, orderByChild, equalTo, get } from "firebase/database";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBHd-1LFAVCD7cDLYck46D9jYCm_nF8lQ8",
  authDomain: "kinetic-cosmos-401712.firebaseapp.com",
  databaseURL: "https://kinetic-cosmos-401712-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kinetic-cosmos-401712",
  storageBucket: "kinetic-cosmos-401712.appspot.com",
  messagingSenderId: "322960450803",
  appId: "1:322960450803:web:aea7ee7feed0221cc78386",
  measurementId: "G-DKTHYRTQ6C"
});


let myData;

const startPage = document.getElementById("startPage");
const nameInput = document.getElementById("nameInput");
const passwordInput = document.getElementById("passwordInput");
const signinBtn = document.getElementById("signinBtn");
const loginBtn = document.getElementById("loginBtn");
const confirmBtn = document.getElementById("confirmBtn");
const backBtn = document.getElementById("backBtn");
let inputMode;

const homePage = document.getElementById("homePage");
const myName = document.getElementById("myName");
const roomList = document.getElementById("roomList");
const createBtn = document.getElementById("createBtn");
const cancelBtn = document.getElementById("cancelBtn");

signinBtn.addEventListener("click", () => {
  nameInput.style.display = "block";
  passwordInput.style.display = "block";
  signinBtn.style.display = "none";
  loginBtn.style.display = "none";
  confirmBtn.style.display = "block";
  backBtn.style.display = "block";
  inputMode = "signin";
});
loginBtn.addEventListener("click", () => {
  nameInput.style.display = "block";
  passwordInput.style.display = "block";
  signinBtn.style.display = "none";
  loginBtn.style.display = "none";
  confirmBtn.style.display = "block";
  backBtn.style.display = "block";
  inputMode = "login";
});
confirmBtn.addEventListener("click", () => {
  const name = nameInput.value;
  const password = passwordInput.value;

  const db = getDatabase();
  const usersRef = child(ref(db), "users");
  const que = query(usersRef, orderByChild("name"), equalTo(name));
  
  get(que).then((snapshot) => {
    if(inputMode === "signin") {
      if(snapshot.exists()) {
        console.log("この名前は既に使われています")
      } else {
        addUser(name, password);
        toHomePage();
      }
  
    } else if(inputMode === "login") {
      if(snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        const value = snapshot.val()[key];
        value["waiting"] = false;
        const data = { 
          id: key,
          info: value
        };

        if(data["info"]["password"] === password) {
          console.log("name: " + name + ", password: " + password + "のユーザーとしてログインしました");
          myData = data;
          toHomePage();
        } else {
          console.log("passwordが違います");
        }
      } else {
        console.log("ユーザーが見つかりません");
      }
    }
  })
});
backBtn.addEventListener("click", () => {
  nameInput.style.display = "none";
  passwordInput.style.display = "none";
  signinBtn.style.display = "block";
  loginBtn.style.display = "block";
  confirmBtn.style.display = "none";
  backBtn.style.display = "none";
  nameInput.value = null;
  passwordInput.value = null;
});
createBtn.addEventListener("click", () => {
  roomList.style.display = "none";
  createBtn.style.display = "none";
  cancelBtn.style.display = "inline";
  changeInfo("waiting", true);
});
cancelBtn.addEventListener("click", () => {
  cancelBtn.style.display = "none";
  roomList.style.display = "block";
  createBtn.style.display = "inline";
  changeInfo("waiting", false);
});

function toHomePage() {
  myName.innerText = myData.info.name;

  startPage.style.display = "none";
  homePage.style.display = "block";

  nameInput.style.display = "none";
  passwordInput.style.display = "none";
  signinBtn.style.display = "block";
  loginBtn.style.display = "block";
  confirmBtn.style.display = "none";
  backBtn.style.display = "none";

  nameInput.value = null;
  passwordInput.value = null;
}

function addUser(name, password) {
  const db = getDatabase();

  const info = {
    name: name,
    password: password,
    waiting: false
  };
  const userKey = push(child(ref(db), "users")).key;

  const updates = {};
  updates["/users/" + userKey] = info;

  myData = {
    id: userKey,
    info: info
  };
  
  console.log("name: " + name + ", password: " + password + "のユーザーを登録しました");
  return update(ref(db), updates);
}

function changeInfo(key, value) {
  const db = getDatabase();

  const updates = {};
  updates["/users/" + myData.id + "/" + key] = value;

  return update(ref(db), updates);
}