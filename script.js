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
let userStatus = true;

/*---------------- Clock -----------------------*/
let clock = () => {
  let date = new Date();
  let clock_hours = date.getHours();
  let clock_minutes = date.getMinutes();
  let clock_seconds = date.getSeconds();
  let clock_period = "AM";
  if (clock_hours == 0) {
    clock_hours = 12;
    clock_period = "AM";
  } else if (clock_hours >= 12) {
    clock_hours -= 12;
    clock_period = "PM";
  }
  clock_hours = clock_hours < 10 ? "0" + clock_hours : clock_hours;
  clock_minutes = clock_minutes < 10 ? "0" + clock_minutes : clock_minutes;
  clock_seconds = clock_seconds < 10 ? "0" + clock_seconds : clock_seconds;
  let time = `${clock_hours}:${clock_minutes}:${clock_seconds} ${clock_period}`;
  $("#clock").text(time);
  setTimeout(clock, 1000);
  //console.log(time);
};
clock();
/*---------------- Server window -----------------------*/
$(".server_list").on("click", "li", function () {
  // console.log($(this).text() + " clicked");
  //getServerChats(serverRef);
  var serverSelected = $(this).find("#server_name").text();
  var getFirstChat = 0;
  // console.log(serverSelected + " clicked");
  serverRef = rtdb.child(serverListRef, serverSelected);
  rtdb.get(serverRef).then((snapshot) => {
    $(".server_list_chats").empty();
    snapshot.forEach((childSnapshot) => {
      if (!getFirstChat) {
        chatSelected = childSnapshot.key;
      }
      chat_windowRef = rtdb.child(serverRef, chatSelected);
      if (childSnapshot.key == chatSelected) {
        $(".server_list_chats").append(
          "<li id=Server_chat class=Selected><a id=chat_name >" +
            childSnapshot.key +
            "</a>" +
            "</li>" +
            "<div class=server_spacer> </div>"
        );
      } else {
        $(".server_list_chats").append(
          "<li id=Server_chat><a id=chat_name>" +
            childSnapshot.key +
            "</a>" +
            "</li>" +
            "<div class=server_spacer> </div>"
        );
      }
      getFirstChat += 1;
    });
    refreshChatWindow();
  });

  if (!$(this).hasClass("active")) {
    //console.log("appearing");
    $(this).toggleClass("active").siblings().removeClass("active");
    $(".server_list_chats").removeClass("hideTransition");
    $(".server_list").removeClass("hideTransition");
    $("#server_text_chat").removeClass("hideTransition");
    $(".server_list_chats").addClass("appearTransition");
    $(".server_list").addClass("appearTransition");
    $("#server_text_chat").addClass("appearTransition");
  } else {
    //console.log("hiding");
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
  rtdb.get(serverRef).then((snapshot) => {
    $(".server_list_chats").empty();
    snapshot.forEach((childSnapshot) => {
      chat_windowRef = rtdb.child(serverRef, chatSelected);
      if (childSnapshot.key == chatSelected) {
        $(".server_list_chats").append(
          "<li id=Server_chat class=Selected><a id=chat_name >" +
            childSnapshot.key +
            "</a>" +
            "</li>" +
            "<div class=server_spacer> </div>"
        );
      } else {
        $(".server_list_chats").append(
          "<li id=Server_chat><a id=chat_name>" +
            childSnapshot.key +
            "</a>" +
            "</li>" +
            "<div class=server_spacer> </div>"
        );
      }
    });
  });
  //console.log("server chat: " + chatSelected);
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
  function show_Chat_UI() {
    //
    $(".login_Section").addClass("moved");
    $("#Login_welcome_message").hide();
    $("#login_text").text("Logged in as " + $("#name_box").val());
    $("#pass_box").val("");
    $("#name_box").val("");
    $("#name_box").hide();
    $("#pass_box").hide();
    $("#Chat_UI").removeClass("hidden");
    $("#Chat_UI").addClass("shown");
    $("#clock").removeClass("hidden");
    $("#clock").addClass("shown");
    $("#name_box_button").val("Logout");
  }
  function hide_Chat_UI() {
    $(".login_Section").removeClass("moved");
    $("#Login_welcome_message").show();
    $("#login_text").show();
    $("#name_box").show();
    $("#pass_box").show();
    $("#Chat_UI").addClass("hidden");
    $("#Chat_UI").removeClass("shown");
    $("#clock").addClass("hidden");
    $("#clock").removeClass("shown");
    $("#login_text").text("Login / Create Account");
    $("#name_box_button").val("Login");
    //// handling server animations
    $(this).toggleClass("active").siblings().removeClass("active");
    $(".server_list_chats").removeClass("appearTransition");
    $(".server_list").removeClass("appearTransition");
    $("#server_text_chat").removeClass("appearTransition");
    $(".server_list_chats").addClass("hideTransition");
    $(".server_list").addClass("hideTransition");
    $("#server_text_chat").addClass("hideTransition");
  }
  $("#name_box").on("keypress", function (keycode) {
    if (keycode.which == 13) {
      if ($("#pass_box").val() != "") {
        loginUser();
        show_Chat_UI();
      } else {
        alert("Please enter Password");
      }
    }
  });

  $("#pass_box").on("keypress", function (keycode) {
    if (keycode.which == 13) {
      if ($("#name_box").val() != "") {
        loginUser();
        show_Chat_UI();
      } else {
        alert("Please enter Username");
      }
    }
  });

  $("#name_box_button").click(function () {
    loginUser();
    if (
      $("#name_box_button").val() == "Login" &&
      $("#pass_box").val() != "" &&
      $("#name_box").val() != ""
    ) {
      show_Chat_UI();
    } else {
      if (confirm("Are you sure you want to logout?")) {
        hide_Chat_UI();
      }
    }
    if ($("#pass_box").val() != "" && $("#name_box").val() == "") {
      alert("Please enter Username");
    } else if ($("#pass_box").val() == "" && $("#name_box").val() != "") {
      alert("Please enter Password");
    }
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

function userUpdateStatus() {
  rtdb.onValue(connectedRef, function (user) {
    if (
      user.val() == true &&
      username != "" &&
      password != "" &&
      userID != ""
    ) {
      console.log("user connected");
    } else if (
      user.val() == false &&
      username != "" &&
      password != "" &&
      userID != ""
    ) {
      console.log("user disconnected");
      // push updated status
      // refresh the profile list
    }
  });
  setTimeout(userUpdateStatus, 5000);
}

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
function refreshServerWindow() {
  $(".server_list").empty();
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
  });
}
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
function refreshAll() {
  serverListRef = rtdb.child(titleRef, "server_list");
  profileStatusRef = rtdb.ref(db, "profile_status");
  connectedRef = rtdb.ref(db, ".info/connected");
  serverRef = rtdb.child(serverListRef, "server 1");
  profilesRef = rtdb.child(titleRef, "profile_list");
  chat_windowRef = rtdb.child(serverRef, chatSelected);
  refreshProfilesWindow();
  refreshChatWindow();
  refreshServerWindow();
  userUpdateStatus();
  //getServerChats(serverRef);
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
            //$("#login_text").text("Logged in as " + username);
            //console.log("Logged in Successfully");
            valid_user = true;
            //showNextPage(); // uncomment this later
            refreshAll();
          }
        }

        if (!valid_user) {
          // credintals don't match DB records
          username = temp_name;
          password = temp_pass;
          userID = generateNewID();
          //console.log("Created new user: " + username);
          let sendUsername = {
            username: username,
            password: password,
            id: userID,
            status: userStatus
          };
          //console.log(password);
          //console.log(sendUsername);
          $(".profile_list").empty();
          rtdb.push(profilesRef, sendUsername); // sending new name to DB
          //$("#login_text").text("Logged in as " + username);
          //showNextPage(); uncomment this later
          refreshAll();
        }
      });
    } else {
      // credentials is not in DB
      username = temp_name;
      password = temp_pass;
      userID = generateNewID();
      //console.log("Created new user: " + username);
      let sendUsername = {
        username: username,
        password: password,
        id: userID,
        status: userStatus
      };
      //console.log(password);
      //console.log(sendUsername);
      $(".profile_list").empty();
      rtdb.push(profilesRef, sendUsername); // sending new name to DB
      //$("#login_text").text("Logged in as " + username);
      //showNextPage(); // uncomment this later
      refreshAll();
    }
  } else {
    if ($("#name_box_button").val() == "Login") {
      alert("Please enter a login");
    }
  }
}