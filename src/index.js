import './styles/main.css';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, push, update, query, orderByChild, equalTo, get, onValue, remove, off } from "firebase/database";

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

// ゲーム調整
let numLength = 3;

let myData;
const db = getDatabase();

const startPage = document.getElementById("startPage");
const startBox1 = document.getElementById("startBox1");
const signinBtn = document.getElementById("signinBtn");
const loginBtn = document.getElementById("loginBtn");
const startBox2 = document.getElementById("startBox2");
const inputModeDisplay = document.getElementById("inputMode");
const nameInput = document.getElementById("nameInput");
const passwordInput = document.getElementById("passwordInput");
const confirmBtn = document.getElementById("confirmBtn");
const backBtn = document.getElementById("backBtn");
let inputMode;

const homePage = document.getElementById("homePage");
const userName = document.getElementById("userName");
const roomList = document.getElementById("roomList");
const createBtn = document.getElementById("createBtn");
const cancelBtn = document.getElementById("cancelBtn");

const battlePage = document.getElementById("battlePage");
const myNameDisplay = document.getElementById("myName");
const myNumsDisplay = document.getElementById("myNums");
const myTBody = document.getElementById("myTBody");
const oppoNameDisplay = document.getElementById("oppoName");
const oppoNumsDisplay = document.getElementById("oppoNums");
const oppoTBody = document.getElementById("oppoTBody");
const resultPart = document.getElementById("resultPart");
const myResult = document.getElementById("myResult")
const leaveBtn = document.getElementById("leaveBtn");
const selectedNumsDisplay = document.getElementById("selectedNums");
const clearBtn = document.getElementById("clearBtn");
const setBtn = document.getElementById("setBtn");

signinBtn.addEventListener("click", () => {
  inputMode = "signin";
  inputModeDisplay.innerText = inputMode;
  startBox1.style.display = "none";
  startBox2.style.display = "block";
});
loginBtn.addEventListener("click", () => {
  inputMode = "login";
  inputModeDisplay.innerText = inputMode;
  startBox1.style.display = "none";
  startBox2.style.display = "block";
});
confirmBtn.addEventListener("click", () => {
  const name = nameInput.value;
  const password = passwordInput.value;

  const usersRef = child(ref(db), "users");
  const que = query(usersRef, orderByChild("name"), equalTo(name));
  
  get(que).then((snapshot) => {
    if(inputMode === "signin") {
      if(snapshot.exists()) {
        console.log("この名前は既に使われています")
      } else {
        addUser(name, password);
        toHomePage("startPage");
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
          toHomePage("startPage");
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
  inputMode = null;
  inputModeDisplay.innerText = null;
  nameInput.value = null;
  passwordInput.value = null;
  startBox2.style.display = "none";
  startBox1.style.display = "block";
});
createBtn.addEventListener("click", () => {
  roomList.style.display = "none";
  createBtn.style.display = "none";
  cancelBtn.style.display = "inline";
  addRoom();
  addBattle();
  changeInfo(myData.id, "waiting", true);
  observeWaiting(true);
});
cancelBtn.addEventListener("click", () => {
  cancelBtn.style.display = "none";
  roomList.style.display = "block";
  createBtn.style.display = "inline";
  remove(ref(db, "/rooms/" + myData.id));
  remove(ref(db, "/battles/" + myData.id));
  observeWaiting(false);
  changeInfo(myData.id, "waiting", false);
});
leaveBtn.addEventListener("click", () => {
  toHomePage("battlePage");
});
for(let i = 0; i <= 9; i++) {
  const button = document.getElementById("btn" + i);
  button.addEventListener("click", () => {
    const num = button.innerText;
    selectedNumsDisplay.innerText = selectedNumsDisplay.innerText + num;

    disableBtn(button);

    if(selectedNumsDisplay.innerText.length === numLength) {
        for(let i = 0; i < 10; i++) {
            const button = document.getElementById("btn" + i);
            disableBtn(button);
        };
        setBtn.disabled = false;
    };
  });
};
clearBtn.addEventListener("click", () => {
  selectedNumsDisplay.innerText = selectedNumsDisplay.innerText.slice(0, -1);
  for(let i = 0; i < 10; i++) {
      const button = document.getElementById("btn" + i);
      button.disabled = false;
      button.classList.remove("selected");
  };
  for(let i = 0; selectedNumsDisplay.innerText.charAt(i); i++) {
      const button = document.getElementById("btn" + selectedNumsDisplay.innerText.charAt(i));
      disableBtn(button);
  };
  setBtn.disabled = true;
});


function toHomePage(from) {
  startPage.style.display = "none";
  battlePage.style.display = "none";
  homePage.style.display = "block";
  observeRooms(true);

  if(from === "startPage") {
    userName.innerText = myData.info.name;
    
    inputMode = null;
    inputModeDisplay.innerText = null;
    nameInput.value = null;
    passwordInput.value = null;
    startBox2.style.display = "none";
    startBox1.style.display = "block";
  } else if(from === "battlePage") {

  };
}

function toBattlePage() {
  homePage.style.display = "none";
  battlePage.style.display = "flex";
  
  observeRooms(false);
  cancelBtn.style.display = "none";
  roomList.style.display = "block";
  createBtn.style.display = "inline";
}

function addUser(name, password) { 
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

function changeInfo(userId, key, value) {
  const updates = {};
  updates["/users/" + userId + "/" + key] = value;

  return update(ref(db), updates);
}

function addRoom() {
  const info = {
    name: myData.info.name
  };
  
  const updates = {};
  updates["/rooms/" + myData.id] = info;
  
  update(ref(db), updates);
}

function addBattle() {
  const updates = {};
  updates["/battles/" + myData.id + "/create"] = myData.info.name;
  updates["/battles/" + myData.id + "/first"] = (Math.random() < 0.5) ? ("create"): ("join");
  
  update(ref(db), updates);
}

function joinBattle(id) {
  remove(ref(db, "/rooms/" + id));

  const updates = {};
  updates["/battles/" + id + "/join"] = myData.info.name;

  update(ref(db), updates);
  
  changeInfo(myData.id, "waiting", false);
  changeInfo(id, "waiting", false);
  prepareBattle(id, "join", "create");
  
  toBattlePage();
}

function observeWaiting(boolen) {
  const que = child(ref(db), "users/" + myData.id + "/waiting");
  if(boolen) {
    onValue(que, (snapshot) => {
      if(!snapshot.val()) {
        prepareBattle(myData.id, "create", "join");
        toBattlePage();
        off(que, "value");
      };
    });
  } else {
    off(que, "value");
  };
}

// observeRoomsでroomsの監視の切り替えを行うと、オンのとき(ホーム画面に行くとき)に一瞬重い
function observeRooms(boolen) {
  const que = child(ref(db), "rooms");
  if(boolen) {
    onValue(que, (snapshot) => {
      const roomTBody = document.getElementById("roomTBody");
      roomTBody.innerHTML = null;
    
      snapshot.forEach(snapshotChild => {
        const name = snapshotChild.val()["name"];
    
        const trTag = document.createElement("tr");
        const nameTdTag = document.createElement("td");
        const joinTdTag = document.createElement("td");
        const buttonTag = document.createElement("button");
        
        nameTdTag.innerText = name;
        trTag.id = name + "'sRoom";
        buttonTag.innerText = "参加";
        buttonTag.addEventListener("click", () => {
          joinBattle(snapshotChild.key);
        });
        
        roomTBody.appendChild(trTag);
        trTag.appendChild(nameTdTag);
        trTag.appendChild(joinTdTag);
        joinTdTag.appendChild(buttonTag);
      });
    });
  } else {
    off(que, "value");
  };
}

function disableBtn(button) {
  button.disabled = true;
  button.classList.add("selected");
}

function initSelectPart(numBtns) {
  selectedNumsDisplay.innerText = null;
  setBtn.disabled = true;
  
  for(let i = 0; i < 10; i++) {
    const button = document.getElementById("btn" + i);
    if(numBtns) {
      button.disabled = false;
      button.classList.remove("selected");
    } else {
      disableBtn(button);
    } ;
  };
}

function prepareBattle(id, myself, opponent) {
  { //battlePageを初期化
    myNameDisplay.innerText = null;
    myNumsDisplay.innerText = null;
    myTBody.innerText = null;
    oppoNameDisplay.innerText = null;
    oppoNumsDisplay.innerText = null;
    oppoTBody.innerText = null;
    myResult.innerText = null;
    resultPart.style.display = "none";
    clearBtn.style.display = "inline";
    setBtn.style.display = "inline";
    initSelectPart(true);
  }

  let myName, oppoName, myNums, oppoNums;
  function setMyNums() {
    console.log("setMyNums押された!")

    myNumsDisplay.innerText = selectedNumsDisplay.innerText;
    clearBtn.style.display = "none";
    setBtn.style.display = "none";
    initSelectPart(false);
    
    const info = {
      nums: myNumsDisplay.innerText
    };
    const updates = {};
    updates["battles/" + id + "/" + myName] = info;
    update(ref(db), updates);

  }
  setBtn.addEventListener("click", setMyNums);

  const que = child(ref(db), "battles/" + id);
  onValue(que, (snapshot) => {
    const info = snapshot.val();
    myName = info[myself];
    oppoName = info[opponent];
    myNums = info[myName] && info[myName]["nums"];
    oppoNums = info[oppoName] && info[oppoName]["nums"];
    myNameDisplay.innerText = myName;
    oppoNameDisplay.innerText = oppoName;
    
    console.log(myName, oppoName, myNums, oppoNums)
    if(oppoNums) {
      oppoNumsDisplay.innerText = "?".repeat(numLength);
    };
    if(myNums && oppoNums) {
      off(que, "value");

      console.log("バトル開始!");

      const first = info.first;
      startBattle(info[first])
    };
  })
  function startBattle(firstName) {
    let round = 1;
    let myAllHit, oppoAllHit;
    function setMyAttack() {
      console.log("setMyAttack押された!")

      clearBtn.style.display = "none";
      setBtn.style.display = "none";
      
      const updates = {};
      updates["battles/" + id + "/" + myName + "/logs/" + round] = selectedNumsDisplay.innerText;
      update(ref(db), updates);

      initSelectPart(false);
    }
    function getHitAndBlow(correctNums, selectedNums) {
      let hit = 0;
      let blow = 0;
      for(let i = 0; i < numLength; i++) {
        if(correctNums[i] === selectedNums[i]) {
          hit += 1;
        } else if(correctNums.includes(selectedNums[i])) {
          blow += 1;
        };
      };
      return {hit, blow};
    }
    
    setBtn.removeEventListener("click", setMyNums);
    setBtn.addEventListener("click", setMyAttack);

    if(firstName === myName) {
      console.log("あなたは先攻です");
      
      clearBtn.style.display = "inline";
      setBtn.style.display = "inline";
      initSelectPart(true);
    } else {
      console.log("あなたは後攻です");
    };

    const myQue = child(ref(db), "battles/" + id + "/" + myName + "/logs");
    const oppoQue = child(ref(db), "battles/" + id + "/" + oppoName + "/logs");
    onValue(myQue, (snapshot) => {
      if(!snapshot.val()) return;

      myTBody.innerHTML = null;

      snapshot.forEach(snapshotChild => {
        const nums = snapshotChild.val();
        const hitAndBlow = getHitAndBlow(oppoNums, nums)

        const trTag = document.createElement("tr");
        const numsTdTag = document.createElement("td");
        const hitTdTag = document.createElement("td");
        const blowTdTag = document.createElement("td");
        
        numsTdTag.innerText = nums;
        hitTdTag.innerText = hitAndBlow.hit;
        blowTdTag.innerText = hitAndBlow.blow;
        
        myTBody.appendChild(trTag);
        trTag.appendChild(numsTdTag);
        trTag.appendChild(hitTdTag);
        trTag.appendChild(blowTdTag);

        myAllHit = (hitAndBlow.hit === numLength);
      });

      if(firstName !== myName) {
        if(myAllHit || oppoAllHit) {
          if(!oppoAllHit) {
            finishBattle("win");
          } else if(!myAllHit) {
            finishBattle("lose");
          } else {
            finishBattle("draw");
          };

          setBtn.removeEventListener("click", setMyAttack);
          off(myQue, "value");
          off(oppoQue, "value");
          return;
        };

        round += 1;
        console.log(round);
      };
    });
    onValue(oppoQue, (snapshot) => {
      if(!snapshot.val()) return;

      oppoTBody.innerHTML = null;

      snapshot.forEach(snapshotChild => {
        const nums = snapshotChild.val();
        const hitAndBlow = getHitAndBlow(myNums, nums)

        const trTag = document.createElement("tr");
        const numsTdTag = document.createElement("td");
        const hitTdTag = document.createElement("td");
        const blowTdTag = document.createElement("td");
        
        numsTdTag.innerText = nums;
        hitTdTag.innerText = hitAndBlow.hit;
        blowTdTag.innerText = hitAndBlow.blow;
        
        oppoTBody.appendChild(trTag);
        trTag.appendChild(numsTdTag);
        trTag.appendChild(hitTdTag);
        trTag.appendChild(blowTdTag);

        oppoAllHit = (hitAndBlow.hit === numLength);
      });

      if(firstName !== oppoName) {
        if(myAllHit || oppoAllHit) {
          if(!oppoAllHit) {
            finishBattle("win");
          } else if(!myAllHit) {
            finishBattle("lose");
          } else {
            finishBattle("draw");
          };

          setBtn.removeEventListener("click", setMyAttack);
          off(myQue, "value");
          off(oppoQue, "value");
          return;
        };

        round += 1;
        console.log(round);
      };

      clearBtn.style.display = "inline";
      setBtn.style.display = "inline";
      initSelectPart(true);
    });
  }
  function finishBattle(result) {
    console.log("バトル終了!")
    
    oppoNumsDisplay.innerText = oppoNums;
    myResult.innerText = result;
    resultPart.style.display = "block";

    remove(ref(db, "/battles/" + id));
  }
}


// battlesでcreate, joinで分けているのは、自分がどっちなのか判別して、myName, oppoNameに入れるため。(逆にそれだけのためのcreate, join)
// だから、ユーザー同士の名前のkeyだけにする(create, joinを消す)場合、myData.info.nameをmyNameに受け取ったkeys配列のうち、それとは異なる名前をoppoNameに入れることになる。
// 先攻後攻を決めるとき、片方(createかjoinか)だけがランダムに決めて、databaseに保存。両者はprepareBattle内でゲーム開始時にそれをdbから受け取って、自分が先攻か後攻かを判断する、
// つまり、createのaddBattle()かjoinのjoinBattle()のとき。そして、firstのvalueをユーザーの名前で指定したい場合、joinが参加した以降、すなわち、後者のとき。(*)
// 加えて、どちらにせよ相手の名前を得るためにdbからgetを使わなければいけない。これを避けるためには、firstのvalueをcreate, joinで指定してやればいい。
// それでprepareBattle時にdbから受け取ったfirstのvalueの情報をもとに先攻のユーザーの名前を得ることができる。
// これにより、prepareBattleではcreate, joinの区別がなくなり情報量が対等である両者が、その時点で先攻のユーザーの情報を得るには、prepareBattle以前に先攻を決めておかなければいけない。
// そのため、create, joinの区別は、少なくともprepareBattleまでは必要であり、firstのvalueもユーザーの名前では指定できず、create, joinを使わざるを得ない。
// したがって、(*)でのdbに保存する片方は、どちらでもいい。であるから、前者のときに行うことにする。
