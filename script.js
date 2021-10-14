/*
(Done)left off: trying to update the profile list to only show updated profiles (need to validate them by ID later)
(Done) #note: messages duplicate as well

(Done)#need to generate a random userID to keep track of messages

need a logout function

(Done)maybe have creating new chat a double click functinallity (and have escape be the cancel)
Maybe have it so it shows which users are online (might need to thave a variable in the database to keep track)

-Have a login page

-add database rules

-add a clock in place of the login section

-have fancy text that shows what chat is selected

(Done)for creating a new chat/server, Have a welcome message so everything gets pushed before people can start messaging
*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtU9OjHvOswT20Ik8MwptHUdNg7YWpa0c",
  authDomain: "chauncechat.firebaseapp.com",
  projectId: "chauncechat",
  storageBucket: "chauncechat.appspot.com",
  messagingSenderId: "576659575299",
  appId: "1:576659575299:web:261d6683629ef0e01f7436",
  measurementId: "G-B4D2V0NNB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let chatSelected = "chat_window";
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let serverListRef = rtdb.child(titleRef, "server_list");
let profileStatusRef = rtdb.ref(db, "profile_status");
let connectedRef = rtdb.ref(db, ".info/connected");
let serverRef = rtdb.child(serverListRef, "server 1");
let profilesRef = rtdb.child(titleRef, "profile_list");
let chat_windowRef = rtdb.child(serverRef, chatSelected);
let server_nameRef = "";
let username = "";
let message = "";
let password = "";
let userID = "";
let pages = ["page1", "page2"];
let currentPageIndex = -1;
/*-----------------Page Logic -------------------------*/
var showNextPage = function () {
  currentPageIndex = (currentPageIndex + 1) % pages.length;
  var template = document.getElementById(pages[currentPageIndex]).innerHTML;
  //do stuff to template here
  display.innerHTML = template;
};
document.addEventListener("click", showNextPage);
//showNextPage();
/*---------------- Server window -----------------------*/
$(".server_list").on("click", "li", function () {
  // console.log($(this).text() + " clicked");
  getServerChats(serverRef);
  var serverSelected = $(this).find("#server_name").text();
  // console.log(serverSelected + " clicked");
  serverRef = rtdb.child(serverListRef, serverSelected);
  rtdb.get(serverRef).then((snapshot) => {
    $(".server_list_chats").empty();
    snapshot.forEach((childSnapshot) => {
      chatSelected = childSnapshot.key;
      chat_windowRef = rtdb.child(serverRef, chatSelected);
      $(".server_list_chats").append(
        "<li id=Server_chat><a id=chat_name>" +
          chatSelected +
          "</a>" +
          "</li>" +
          "<div class=server_spacer> </div>"
      );
    });
    refreshChatWindow();
  });

  if (!$(this).hasClass("active")) {
    console.log("appearing");
    $(this).toggleClass("active").siblings().removeClass("active");
    $(".server_list_chats").removeClass("hideTransition");
    $(".server_list").removeClass("hideTransition");
    $("#server_text_chat").removeClass("hideTransition");
    $(".server_list_chats").addClass("appearTransition");
    $(".server_list").addClass("appearTransition");
    $("#server_text_chat").addClass("appearTransition");
  } else {
    console.log("hiding");
    $(this).toggleClass("active").siblings().removeClass("active");
    $(".server_list_chats").removeClass("appearTransition");
    $(".server_list").removeClass("appearTransition");
    $("#server_text_chat").removeClass("appearTransition");
    $(".server_list_chats").addClass("hideTransition");
    $(".server_list").addClass("hideTransition");
    $("#server_text_chat").addClass("hideTransition");
  }
});

$(".server_list").on("dblclick", "li", function () {
  var newchatname = prompt("Enter new chat name");
  if (newchatname != null) {
    newchatname = newchatname.toLowerCase();
    var serverSelected = $(this).find("#server_name").text();
    serverRef = rtdb.child(serverListRef, serverSelected);
    chat_windowRef = rtdb.child(serverRef, newchatname);
    let WelcomeMessage = {
      username: "Server",
      message: "Welcome to " + newchatname + " chat",
      id: null
    };
    rtdb.push(chat_windowRef, WelcomeMessage);
    refreshChatWindow();
  }
});

$(".server_list_chats").on("click", "li", function () {
  chatSelected = $(this).find("#chat_name").text();
  console.log("server chat: " + chatSelected);
  refreshChatWindow();
});

$("#new_server_button").click(function () {
  var new_server_name = prompt("Enter new server name").toLowerCase();
  serverRef = rtdb.child(serverListRef, new_server_name);
  // rtdb.push(serverRef, { name: new_server_name });
  chatSelected = "general";
  chat_windowRef = rtdb.child(serverRef, chatSelected);
  //rtdb.push(serverListRef, { name: new_server_name });
  let WelcomeMessage = {
    username: "Server",
    message: "Welcome to " + new_server_name + " general chat",
    id: null
  };
  rtdb.push(chat_windowRef, WelcomeMessage);
  refreshChatWindow();
});

rtdb.onValue(serverListRef, (ss) => {
  $(".server_list").empty();
  ss.forEach(function (entry) {
    $(".server_list").append(
      "<li id=Server><a id=server_name>" +
        entry.key +
        "</a>" +
        "</li>" +
        "<div class=server_spacer> </div>"
    );
  });
  ///////////////////////// IM SO SMART
  // rtdb.onValue(serverListRef, (snapshot) => {
  //   snapshot.forEach((childSnapshot) => {
  //     const childKey = childSnapshot.key;
  //     const childData = childSnapshot.val();
  //     //console.log(childKey);
  //   });
  // });
  ///////////////////////////////
});

function getServerChats(server_ref) {
  var chatString = "";
  rtdb.get(server_ref).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      chatString += "<p>" + childSnapshot.key + "</p>";
    });
  });
  return chatString;
}

/*---------------- Updating Chat Window ----------------*/

rtdb.onValue(chat_windowRef, (ss) => {
  $(".chat_window").empty();
  //console.log("updating window");
  chat_windowRef = rtdb.child(serverRef, chatSelected);
  ss.forEach(function (entry) {
    if (userID == entry.val().id) {
      // reasigns your messages
      $(".chat_window").append(
        "<li class= chat_message id=my_message>" + entry.val().message + "</li>"
      );
    } else {
      $(".chat_window").append(
        "<div class=chat_spacer>" + entry.val().username + "</div>"
      );
      // other people's messages
      $(".chat_window").append(
        "<li class= chat_message id=other_user_messages>" +
          entry.val().message +
          "</li>"
      );
    }
  });
});
/*---------------- Updating Profiles List ----------------*/
rtdb.onValue(profilesRef, (ss) => {
  $(".profile_list").empty();
  ss.forEach(function (entry) {
    if (entry.val().id == userID) {
      $(".profile_list").append(
        "<li id=user_online>" + entry.val().username + "</li>"
      );
    } else {
      $(".profile_list").append(
        "<li id=user_offline>" + entry.val().username + "</li>"
      );
    }
  });
});

function refreshProfilesWindow() {
  rtdb.onValue(profilesRef, (ss) => {
    $(".profile_list").empty();
    ss.forEach(function (entry) {
      if (entry.val().id == userID) {
        $(".profile_list").append(
          "<li id=user_online>" + entry.val().username + "</li>"
        );
      } else {
        $(".profile_list").append(
          "<li id=user_offline>" + entry.val().username + "</li>"
        );
      }
    });
  });
}

/*---------------- User Login ----------------*/
{
  $("#name_box").on("keypress", function (keycode) {
    if (keycode.which == 13) {
      if ($("#pass_box").val() != "") {
        loginUser();
      } else {
        alert("Please enter Password");
      }
    }
  });

  $("#pass_box").on("keypress", function (keycode) {
    if (keycode.which == 13) {
      if ($("#name_box").val() != "") {
        loginUser();
      } else {
        alert("Please enter Username");
      }
    }
  });

  $("#name_box_button").click(function () {
    loginUser();
  });
}

var isOfflineForDatabase = {
  state: "offline"
};

var isOnlineForDatabase = {
  state: "online"
};

rtdb.onValue(connectedRef, function (user) {
  // need to manually call this like the chatrefresh(), it might only be called once before a user has a chance to log in
  if (user.val() == true && username != "" && password != "" && userID != "") {
    console.log("user connected");
  } else if (
    user.val() == false &&
    username != "" &&
    password != "" &&
    userID != ""
  ) {
    console.log("user disconnected");
  }
});

/*---------------- Sending Message ----------------*/

$(".Message_Box").on("keypress", function (keycode) {
  if (keycode.which == 13) {
    let message = $("#text_box").val();
    if (username != "" && password != "" && userID != "") {
      let sendMessage = { username: username, message: message, id: userID };
      rtdb.push(chat_windowRef, sendMessage);
      refreshChatWindow();
      $("#text_box").val("");
    } else {
      alert("Please login first");
    }
  }
});
/*--------------- hash password -----------------*/
String.prototype.hashCode = function () {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/*-------------- Generate ID -----------------*/
let generateNewID = () => {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

function refreshChatWindow() {
  //console.log("Refreshing chat Window: "+chatSelected);
  chat_windowRef = rtdb.child(serverRef, chatSelected);
  $(".chat_window").empty();
  rtdb.get(chat_windowRef).then((ss) => {
    ss.forEach(function (entry) {
      if (userID == entry.val().id) {
        // reasigns your messages
        $(".chat_window").append(
          "<li id=my_message>" + entry.val().message + "</li>"
        );
      } else {
        $(".chat_window").append(
          "<div class=chat_spacer>" + entry.val().username + "</div>"
        );
        // other people's messages
        $(".chat_window").append(
          "<li id=other_user_messages>" + entry.val().message + "</li>"
        );
      }
    });
  });
}

function loginUser() {
  let temp_name = $("#name_box").val();
  let temp_pass = $("#pass_box").val().hashCode();
  let foundName = null;
  if (temp_name != "" || temp_pass != "") {
    $(".profile_list li").each((id, elem) => {
      if (elem.innerText == temp_name) {
        // credentials is already in DB
        foundName = true;
        return false; // yes this is supposed to be like this
      }
    });
    if (foundName == true) {
      // validate is correct person
      let valid_user = false; // bool to check verification
      rtdb.get(profilesRef).then((ss) => {
        let DB_profiles = ss.val();
        for (let x in DB_profiles) {
          if (
            temp_name == DB_profiles[x].username &&
            temp_pass == DB_profiles[x].password
          ) {
            username = temp_name;
            password = temp_pass;
            userID = DB_profiles[x].id;
            $("#login_text").text("Logged in as " + username);
            console.log("Logged in Successfully");
            valid_user = true;
            refreshChatWindow();
            refreshProfilesWindow();
          }
        }

        if (!valid_user) {
          // credintals don't match DB records
          username = temp_name;
          password = temp_pass;
          userID = generateNewID();
          console.log("Created new user: " + username);
          let sendUsername = {
            username: username,
            password: password,
            id: userID
          };
          //console.log(password);
          //console.log(sendUsername);
          $(".profile_list").empty();
          rtdb.push(profilesRef, sendUsername); // sending new name to DB
          $("#login_text").text("Logged in as " + username);
          refreshChatWindow();
          refreshProfilesWindow();
        }
      });
    } else {
      // credentials is not in DB
      username = temp_name;
      password = temp_pass;
      userID = generateNewID();
      console.log("Created new user: " + username);
      let sendUsername = { username: username, password: password, id: userID };
      //console.log(password);
      //console.log(sendUsername);
      $(".profile_list").empty();
      rtdb.push(profilesRef, sendUsername); // sending new name to DB
      $("#login_text").text("Logged in as " + username);
      refreshChatWindow();
      refreshProfilesWindow();
    }
  } else {
    alert("Please enter a login");
  }
}
/////////////////////// Robot Logic /////////////////
{
  class Robot {
    constructor(color, light, size, x, y, struct) {
      this.x = x;
      this.points = [];
      this.links = [];
      this.frame = 0;
      this.dir = 1;
      this.size = size;
      this.color = Math.round(color);
      this.light = light;
      // ---- create points ----
      for (const p of struct.points) {
        this.points.push(new Robot.Point(size * p.x + x, size * p.y + y, p.f));
      }
      // ---- create links ----
      for (const link of struct.links) {
        const p0 = this.points[link.p0];
        const p1 = this.points[link.p1];
        const dx = p0.x - p1.x;
        const dy = p0.y - p1.y;
        this.links.push(
          new Robot.Link(
            this,
            p0,
            p1,
            Math.sqrt(dx * dx + dy * dy),
            (link.size * size) / 3,
            link.lum,
            link.force,
            link.disk
          )
        );
      }
    }
    update() {
      if (++this.frame % 20 === 0) this.dir = -this.dir;
      if (
        dancerDrag &&
        this === dancerDrag &&
        this.size < 16 &&
        this.frame > 600
      ) {
        dancerDrag = null;
        dancers.push(
          new Robot(
            this.color,
            this.light * 1.25,
            this.size * 2,
            pointer.x,
            pointer.y - 100 * this.size * 2,
            struct
          )
        );
        dancers.sort(function (d0, d1) {
          return d0.size - d1.size;
        });
      }
      // ---- update links ----
      for (const link of this.links) {
        const p0 = link.p0;
        const p1 = link.p1;
        const dx = p0.x - p1.x;
        const dy = p0.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist) {
          const tw = p0.w + p1.w;
          const r1 = p1.w / tw;
          const r0 = p0.w / tw;
          const dz = (link.distance - dist) * link.force;
          const sx = (dx / dist) * dz;
          const sy = (dy / dist) * dz;
          p1.x -= sx * r0;
          p1.y -= sy * r0;
          p0.x += sx * r1;
          p0.y += sy * r1;
        }
      }
      // ---- update points ----
      for (const point of this.points) {
        // ---- dragging ----
        if (this === dancerDrag && point === pointDrag) {
          point.x += (pointer.x - point.x) * 0.1;
          point.y += (pointer.y - point.y) * 0.1;
        }
        // ---- dance ----
        if (this !== dancerDrag) {
          point.fn && point.fn(16 * Math.sqrt(this.size), this.dir);
        }
        // ---- verlet integration ----
        point.vx = point.x - point.px;
        point.vy = point.y - point.py;
        point.px = point.x;
        point.py = point.y;
        point.vx *= 0.995;
        point.vy *= 0.995;
        point.x += point.vx;
        point.y += point.vy + 0.01;
      }
      // ---- ground ----
      for (const link of this.links) {
        const p1 = link.p1;
        if (p1.y > canvas.height * ground - link.size * 0.5) {
          p1.y = canvas.height * ground - link.size * 0.5;
          p1.x -= p1.vx;
          p1.vx = 0;
          p1.vy = 0;
        }
      }
      // ---- center position ----
      const delta = (this.x - this.points[0].x) * 0.0002;
      this.points[9].x += delta;
      this.points[10].x += delta;
    }
    draw() {
      for (const link of this.links) {
        if (link.size) {
          const dx = link.p1.x - link.p0.x;
          const dy = link.p1.y - link.p0.y;
          const a = Math.atan2(dy, dx);
          const d = Math.sqrt(dx * dx + dy * dy);
          // ---- shadow ----
          ctx.save();
          ctx.translate(
            link.p0.x + link.size * 0.25,
            link.p0.y + link.size * 0.25
          );
          ctx.rotate(a);
          ctx.drawImage(
            link.shadow,
            -link.size * 0.5,
            -link.size * 0.5,
            d + link.size,
            link.size
          );
          ctx.restore();
          // ---- stroke ----
          ctx.save();
          ctx.translate(link.p0.x, link.p0.y);
          ctx.rotate(a);
          ctx.drawImage(
            link.image,
            -link.size * 0.5,
            -link.size * 0.5,
            d + link.size,
            link.size
          );
          ctx.restore();
        }
      }
    }
  }
  Robot.Link = class Link {
    constructor(parent, p0, p1, dist, size, light, force, disk) {
      // ---- cache strokes ----
      function stroke(color, axis) {
        const image = document.createElement("canvas");
        image.width = dist + size;
        image.height = size;
        const ict = image.getContext("2d");
        ict.beginPath();
        ict.lineCap = "round";
        ict.lineWidth = size;
        ict.strokeStyle = color;
        if (disk) {
          ict.arc(size * 0.5 + dist, size * 0.5, size * 0.5, 0, 2 * Math.PI);
          ict.fillStyle = color;
          ict.fill();
        } else {
          ict.moveTo(size * 0.5, size * 0.5);
          ict.lineTo(size * 0.5 + dist, size * 0.5);
          ict.stroke();
        }
        if (axis) {
          const s = size / 10;
          ict.fillStyle = "#000";
          ict.fillRect(size * 0.5 - s, size * 0.5 - s, s * 2, s * 2);
          ict.fillRect(size * 0.5 - s + dist, size * 0.5 - s, s * 2, s * 2);
        }
        return image;
      }
      this.p0 = p0;
      this.p1 = p1;
      this.distance = dist;
      this.size = size;
      this.light = light || 1.0;
      this.force = force || 0.5;
      this.image = stroke(
        "hsl(" + parent.color + " ,30%, " + parent.light * this.light + "%)",
        true
      );
      this.shadow = stroke("rgba(0,0,0,0.5)");
    }
  };
  Robot.Point = class Point {
    constructor(x, y, fn, w) {
      this.x = x;
      this.y = y;
      this.w = w || 0.5;
      this.fn = fn || null;
      this.px = x;
      this.py = y;
      this.vx = 0.0;
      this.vy = 0.0;
    }
  };
  // ---- set canvas ----
  const canvas = {
    init() {
      this.elem = document.querySelector("canvas");
      this.resize();
      window.addEventListener("resize", () => this.resize(), false);
      return this.elem.getContext("2d");
    },
    resize() {
      this.width = this.elem.width = this.elem.offsetWidth;
      this.height = this.elem.height = this.elem.offsetHeight;
      ground = this.height > 500 ? 0.85 : 1.0;
      for (let i = 0; i < dancers.length; i++) {
        dancers[i].x = ((i + 2) * canvas.width) / 9;
      }
    }
  };
  // ---- set pointer ----
  const pointer = {
    init(canvas) {
      this.x = 0;
      this.y = 0;
      window.addEventListener("mousemove", (e) => this.move(e), false);
      canvas.elem.addEventListener("touchmove", (e) => this.move(e), false);
      window.addEventListener("mousedown", (e) => this.down(e), false);
      window.addEventListener("touchstart", (e) => this.down(e), false);
      window.addEventListener("mouseup", (e) => this.up(e), false);
      window.addEventListener("touchend", (e) => this.up(e), false);
    },
    down(e) {
      this.move(e);
      for (const dancer of dancers) {
        for (const point of dancer.points) {
          const dx = pointer.x - point.x;
          const dy = pointer.y - point.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 60) {
            dancerDrag = dancer;
            pointDrag = point;
            dancer.frame = 0;
          }
        }
      }
    },
    up(e) {
      dancerDrag = null;
    },
    move(e) {
      let touchMode = e.targetTouches,
        pointer;
      if (touchMode) {
        e.preventDefault();
        pointer = touchMode[0];
      } else pointer = e;
      this.x = pointer.clientX;
      this.y = pointer.clientY;
    }
  };
  // ---- init ----
  const dancers = [];
  let ground = 1.0;
  const ctx = canvas.init();
  pointer.init(canvas);
  let dancerDrag = null;
  let pointDrag = null;
  // ---- main loop ----
  const run = () => {
    requestAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    // ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);
    // ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);
    for (const dancer of dancers) {
      dancer.update();
      dancer.draw();
    }
  };
  // ---- robot structure ----
  const struct = {
    points: [
      {
        x: 0,
        y: -4,
        f(s, d) {
          this.y -= 0.01 * s;
        }
      },
      {
        x: 0,
        y: -16,
        f(s, d) {
          this.y -= 0.02 * s * d;
        }
      },
      {
        x: 0,
        y: 12,
        f(s, d) {
          this.y += 0.02 * s * d;
        }
      },
      { x: -12, y: 0 },
      { x: 12, y: 0 },
      {
        x: -3,
        y: 34,
        f(s, d) {
          if (d > 0) {
            this.x += 0.01 * s;
            this.y -= 0.015 * s;
          } else {
            this.y += 0.02 * s;
          }
        }
      },
      {
        x: 3,
        y: 34,
        f(s, d) {
          if (d > 0) {
            this.y += 0.02 * s;
          } else {
            this.x -= 0.01 * s;
            this.y -= 0.015 * s;
          }
        }
      },
      {
        x: -28,
        y: 0,
        f(s, d) {
          this.x += this.vx * 0.035;
          this.y -= 0.001 * s;
        }
      },
      {
        x: 28,
        y: 0,
        f(s, d) {
          this.x += this.vx * 0.035;
          this.y -= 0.001 * s;
        }
      },
      {
        x: -3,
        y: 64,
        f(s, d) {
          this.y += 0.015 * s;
          if (d > 0) {
            this.y -= 0.01 * s;
          } else {
            this.y += 0.05 * s;
          }
        }
      },
      {
        x: 3,
        y: 64,
        f(s, d) {
          this.y += 0.015 * s;
          if (d > 0) {
            this.y += 0.05 * s;
          } else {
            this.y -= 0.01 * s;
          }
        }
      }
    ],
    links: [
      { p0: 3, p1: 7, size: 12, lum: 0.5 },
      { p0: 1, p1: 3, size: 24, lum: 0.5 },
      { p0: 1, p1: 0, size: 60, lum: 0.5, disk: 1 },
      { p0: 5, p1: 9, size: 16, lum: 0.5 },
      { p0: 2, p1: 5, size: 32, lum: 0.5 },
      { p0: 1, p1: 2, size: 50, lum: 1 },
      { p0: 6, p1: 10, size: 16, lum: 1.5 },
      { p0: 2, p1: 6, size: 32, lum: 1.5 },
      { p0: 4, p1: 8, size: 12, lum: 1.5 },
      { p0: 1, p1: 4, size: 24, lum: 1.5 }
    ]
  };
  // ---- instanciate robots ----
  for (let i = 0; i < 6; i++) {
    dancers.push(
      new Robot(
        (i * 360) / 7,
        80,
        0.6,
        ((i + 2) * canvas.width) / 9,
        canvas.height * ground - 340,
        struct
      )
    );
  }
  //run();
}