var rhit = rhit || {};

rhit.fbAuthManager = null;
rhit.myPlansManager = null;
rhit.todaysWorkoutManager = null;
rhit.upcomingWorkoutsManager = null;
rhit.existingPlansManager = null;
rhit.PLANS_COLLECTION = "Workout Plans";
rhit.EXERCISES_COLLECTION = "Exercises";
rhit.DAYS_KEY = "Days";
rhit.favoritePlan = null;
rhit.pastWorkoutsManager = null;
// rhit.daysInARow = null;

let weekday = new Date().getDay();
let streak = 0;

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

rhit.setFavorite = function (wp) {
  rhit.favoritePlan = wp;
};
//
// WORKOUT PLAN OBJECT
//
rhit.WorkoutPlan = class {
  constructor(
    id,
    name,
    goal,
    level,
    sessions,
    uid,
    time,
    favorite,
    exercises,
    startDate
  ) {
    this.id = id;
    this.name = name;
    this.goal = goal;
    this.level = level;
    this.sessions = sessions;
    this.uid = uid;
    this.time = time;
    this.favorite = favorite;
    this.exercises = exercises;
    this.startDate = startDate;
  }
};

// rhit.WorkoutPlan = class {
//   constructor(id, name, goal, level, sessions, uid, time, favorite, exercises, startDate) {
//     this.id = id;
//     this.name = name;
//     this.goal = goal;
//     this.level = level;
//     this.sessions = sessions;
//     this.uid = uid;
//     this.time = time;
//     this.favorite = favorite;
//     this.exercises = exercises;
//     this.startDate = startDate;
//   }
// };
rhit.Upcoming = class {
  constructor(id, day, month, year, plan, uid, complete) {
    this.id = id;
    this.day = day;
    this.month = month;
    this.year = year;
    this.plan = plan;
    this.uid = uid;
    this.complete = complete;
  }
};

//
// MANAGERS
//
rhit.MyPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    // console.log(this._ref);
    this._unsubscribe = null;
  }
  add(name, goal, diff, days, favorite, time, exercises) {
    this._ref.add({
      ["Name"]: name,
      ["Goal"]: goal,
      ["Difficulty"]: diff,
      ["Days"]: days,
      ["favorite"]: favorite,
      ["uid"]: rhit.fbAuthManager.uid,
      ["time"]: time,
      ["Weekday"]: exercises,
      ["startDate"]: firebase.firestore.Timestamp.now(),
    });
  }

  addExisting(wp) {
    this.add(
      wp.name,
      wp.goal,
      wp.level,
      wp.sessions,
      wp.favorite,
      wp.time,
      wp.exercises
    );
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  get length() {
    return this._documentSnapshots.length;
  }
  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(
      docSnapshot.id,
      docSnapshot.get("Name"),
      docSnapshot.get("Goal"),
      docSnapshot.get("Difficulty"),
      docSnapshot.get("Days"),
      docSnapshot.get("uid"),
      docSnapshot.get("time"),
      docSnapshot.get("favorite"),
      docSnapshot.get("Weekday"),
      docSnapshot.get("startDate")
    );
    return wp;
  }
};

rhit.ExistingPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    this._unsubscribe = null;
  }

  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  add(name, goal, diff, days, favorite, time, exercises, startDate) {
    this._ref.add({
      ["Name"]: name,
      ["Goal"]: goal,
      ["Difficulty"]: diff,
      ["Days"]: days,
      ["favorite"]: favorite,
      ["uid"]: rhit.fbAuthManager.uid,
      ["time"]: time,
      ["Weekday"]: exercises,
      ["startDate"]: startDate,
    });
  }
  addExisting(wp, startDate) {
    this.add(
      wp.name,
      wp.goal,
      wp.level,
      wp.sessions,
      wp.favorite,
      wp.time,
      wp.exercises,
      startDate
    );
  }
  stopListening() {
    this._unsubscribe();
  }

  get length() {
    return this._documentSnapshots.length;
  }

  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(
      docSnapshot.id,
      docSnapshot.get("Name"),
      docSnapshot.get("Goal"),
      docSnapshot.get("Difficulty"),
      docSnapshot.get("Days"),
      docSnapshot.get("uid"),
      docSnapshot.get("time"),
      docSnapshot.get("favorite"),
      docSnapshot.get("Weekday"),
      docSnapshot.get("startDate")
    );
    return wp;
  }
};

rhit.FBAuthManager = class {
  constructor() {
    this._user = null;
  }

  beginListening() {
    firebase.auth().onAuthStateChanged((user) => {
      this._user = user;
    });
  }

  startFirebaseUI = function () {
    var uiConfig = {
      signInSuccessUrl: "/home.html",
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    };
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start(`#firebaseui-auth-container`, uiConfig);
  };

  signOut = function () {
    firebase
      .auth()
      .signOut()
      .then(function () {
        console.log("Sign out successful");
      })
      .catch(function (error) {
        console.log("Sign out failed");
      });
  };

  get uid() {
    return this._user.uid;
  }
};

rhit.ExercisesManager = class {
  constructor(planId) {
    this._documentSnapshot = {};
    this._unsubscribe = null;
    this._ref = firebase.firestore().collection("Workout Plans").doc(planId);
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((doc) => {
      if (doc.exists) {
        console.log("Document data: ", doc.data());
        this._documentSnapshot = doc;
        changeListener();
      } else {
        console.log("No such document!");
      }
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  getExercisesFor(day) {
    return this._documentSnapshot.get("Weekday")[day];
  }

  update(day, exName, sets, reps, weight) {
    this._ref
      .update({
        ["Weekday." + day + "." + exName]: {
          sets: sets,
          reps: reps,
          weight: weight,
        },
      })
      .then(() => {
        console.log("document successfulle updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  delete() {
    return this._ref.delete();
  }
  // get exName() {
  //   return this._documentSnapshot.get("Name");
  // }
};

rhit.PastWorkoutsManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._unsubscribe = null;
    this._ref = firebase.firestore().collection("Past Days");
    console.log(this._ref);
  }
  beginListening(changeListener) {
    let query = this._ref
      .orderBy("year")
      .orderBy("month")
      .orderBy("day", "desc")
      .limit(10);
    this._unsubscribe = query.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  update(day, exName, sets, reps, weight) {
    this._ref
      .update({
        ["Weekday." + day + "." + exName]: {
          sets: sets,
          reps: reps,
          weight: weight,
        },
      })
      .then(() => {
        console.log("document successfulle updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  delete() {
    return this._ref.delete();
  }

  get length() {
    return this._documentSnapshots.length;
  }

  getUpcomingAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.Upcoming(
      docSnapshot.id,
      docSnapshot.get("day"),
      docSnapshot.get("month"),
      docSnapshot.get("year"),
      docSnapshot.get("plan"),
      docSnapshot.get("uid"),
      docSnapshot.get("complete")
    );
    return wp;
  }

  set(day, month, year, plan, uid, complete) {
    this._ref
      .doc(day + month + year + plan + uid)
      .set(
        {
          ["day"]: day,
          ["month"]: month,
          ["year"]: year,
          ["plan"]: plan,
          ["uid"]: uid,
          ["complete"]: complete,
        },
        {
          merge: true,
        }
      )
      .then(() => {
        console.log("document successfully added");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }
};

rhit.UpcomingWorkoutsManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("upcoming");
    this._unsubscribe = null;
  }
  beginListening(changeListener) {
    // let query = this._ref.orderBy("year").orderBy("month").orderBy("day", "desc").limit(10);
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  // add(day, month, year, plan, uid) {
  //   this._ref.add({
  //     ["day"]: day,
  //     ["month"]: month,
  //     ["year"]: year,
  //     ["plan"]: plan,
  //     ["uid"]: uid
  //   }).then(() => {
  //     console.log("document successfully added");
  //   }).catch(function (error) {
  //     console.log("Error adding document: ", error);
  //   });
  // }

  set(day, month, year, plan, uid, complete) {
    this._ref
      .doc(day + month + year + plan + uid)
      .set(
        {
          ["day"]: day,
          ["month"]: month,
          ["year"]: year,
          ["plan"]: plan,
          ["uid"]: uid,
          ["complete"]: complete,
        },
        {
          merge: true,
        }
      )
      .then(() => {
        console.log("document successfully added");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }
  // update(day, exName, sets, reps, weight) {
  //   this._ref
  //     .update({
  //       ["Weekday." + day + "." + exName]: {
  //         sets: sets,
  //         reps: reps,
  //         weight: weight,
  //       },
  //     })
  //     .then(() => {
  //       console.log("document successfulle updated");
  //     })
  //     .catch(function (error) {
  //       console.log("Error adding document: ", error);
  //     });
  // }
  get length() {
    // console.log(this._documentSnapshots.length);
    return this._documentSnapshots.length;
  }
  getUpcomingAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.Upcoming(
      docSnapshot.id,
      docSnapshot.get("day"),
      docSnapshot.get("month"),
      docSnapshot.get("year"),
      docSnapshot.get("plan"),
      docSnapshot.get("uid")
    );
    return wp;
  }

  delete(wp) {
    return this._ref.doc(wp.id).delete();
  }
};

rhit.SinglePlanManager = class {
  constructor(planId) {
    this._documentSnapshot = [];
    this._unsubscribe = null;
    this._ref = firebase.firestore().collection("Workout Plans").doc(planId);
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((doc) => {
      if (doc.exists) {
        console.log("Document data: ", doc.data());
        this._documentSnapshot = doc;
        changeListener();
      } else {
        console.log("No such document!");
        // window.location.href = "/"'
      }
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  setFav(fav) {
    this._ref
      .update({
        ["favorite"]: fav,
      })
      .then(() => {
        console.log("document successfully updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  update(name, goal, diff, days, favorite, time, exercises) {
    // console.log("update quote movie");
    this._ref
      .update({
        ["Name"]: name,
        ["Goal"]: goal,
        ["Difficulty"]: diff,
        ["Days"]: days,
        ["favorite"]: favorite,
        ["uid"]: rhit.fbAuthManager.uid,
        ["time"]: time,
        ["favorite"]: favorite,
        ["Weekday"]: exercises,
      })
      .then(() => {
        console.log("document successfulle updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  delete() {
    return this._ref.delete();
  }

  get name() {
    return this._documentSnapshot.get("Name");
  }

  get amtDays() {
    this._documentSnapshot.get("Days");
  }
  get goal() {
    return this._documentSnapshot.get("Goal");
  }
};

rhit.TodaysWorkoutManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    // console.log(this._ref);
    this._unsubscribe = null;
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((doc) => {
      if (doc.exists) {
        console.log("Document data: ", doc.data());
        this._documentSnapshot = doc;
        changeListener();
      } else {
        console.log("No such document!");
      }
    });
  }
  stopListening() {
    this._unsubscribe();
  }
};

//
// PAGE CONTROLLERS
//
rhit.MyPlansController = class {
  constructor() {
    document.querySelector("#submitCustomDialog").onclick = (event) => {
      const planName = document.querySelector("#inputPlanName").value;
      rhit.myPlansManager.add(planName, "", "", "", false, "", "");
    };
    document.querySelector("#existingButton").onclick = (event) => {
      window.location.href = "/existingPlans.html";
    };

    $("#addCustomDialog").on("show.bs.modal", (event) => {
      document.querySelector("#inputPlanName").value = "";
    });
    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(wp) {
    console.log(wp.name, wp.favorite);
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card" id="favorite-${wp.favorite}">
        <h5 class="card-title">&nbsp;&nbsp;&nbsp;&nbsp;${wp.name}</h5>
        
      </div>
    </div>`
    );
  }

  updateList() {
    const newList = htmlToElement(`<div id="plansList"></div>`);

    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.favorite == true) {
        rhit.favoritePlan = wp;
      }
      const newCard = this._createCard(wp);

      newCard.onclick = (event) => {
        window.location.href = `/plan.html?id=${wp.id}`;
      };
      //TODO: ADD LISTENERS FOR EDIT FAVORITE AND DELETE BUTTONS
      if (wp.uid == rhit.fbAuthManager.uid) {
        // newCard.onclick = (event) => {
        // 	window.location.href = `/moviequote.html?id=${mq.id}`;
        // }

        newList.appendChild(newCard);
      }
    }

    const oldList = document.querySelector("#plansList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }
};

rhit.SinglePlanController = class {
  constructor(planId) {
    rhit.myPlansManager.beginListening(this.updateView.bind(this));
    rhit.singlePlanManager.beginListening(this.updateView.bind(this));
    rhit.upcomingWorkoutsManager.beginListening(this.updateView.bind(this));

    document.querySelector("#backPlan").onclick = (event) => {
      window.location.href = "myPlans.html";
    };
    document.querySelector("#editPlan").onclick = (event) => {
      window.location.href = `/customPlans.html?id=${planId}`;
    };

    document
      .querySelector("#submitDeletePlan")
      .addEventListener("click", (event) => {
        rhit.singlePlanManager
          .delete()
          .then(function () {
            window.location.href = "/myPlans.html";
          })
          .catch(function (error) {
            console.log("error removing doc", error);
          });
      });

    document.querySelector("#customSetActive").onclick = (event) => {
      // console.log(rhit.upcomingWorkoutsManager.length);
      for (let i = 0; i < rhit.myPlansManager.length; i++) {
        // console.log(rhit.myPlansManager.length);
        const wp = rhit.myPlansManager.getPlanAtIndex(i);
        this.singlePlanManager = new rhit.SinglePlanManager(wp.id);

        // wp.favorite
        if (wp.uid == rhit.fbAuthManager.uid) {
          console.log(wp.id);
          if (wp.id === planId) {
            console.log(wp.id);
            this.singlePlanManager.setFav(true);
          } else {
            this.singlePlanManager.setFav(false);
          }
        }
      }
      console.log("working");
      for (let i = 0; i < rhit.upcomingWorkoutsManager.length; i++) {
        const wp = rhit.upcomingWorkoutsManager.getUpcomingAtIndex(i);
        if (wp.uid == rhit.fbAuthManager.uid) {
          console.log("del");
          rhit.upcomingWorkoutsManager.delete(wp);
        }
      }

      alert("This plan has been set has active");
    };
  }
  updateView() {
    document.querySelector("#cardPlan").innerHTML = rhit.singlePlanManager.name;
    // document.querySelector("#cardGoal").innerHTML = "bbbbbb";
  }
};

rhit.NextWorkoutController = class {
  constructor() {
    rhit.exercisesManager.beginListening(this.updateList.bind(this));
    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(prev) {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return htmlToElement(
      ` <button type="button" id="future" class="collapsible">${
        weekdays[prev.getDay()]
      }, ${
        months[prev.getMonth()]
      } ${prev.getDate()}, ${prev.getFullYear()}</button>
      <div id=expansion></div>`
    );
  }

  _contentDay(day) {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return htmlToElement(
      `<h5 id="appear">&emsp;${weekdays[day.getDay()]}, ${
        months[day.getMonth()]
      } ${day.getDate()}, ${day.getFullYear()}</h5>`
    );
  }
  _contentCard(key, val) {
    return htmlToElement(
      `<div id="appear">
      <div>&emsp;&emsp;&emsp;Exercise: ${key}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Sets: ${val.sets}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Repetitions: ${val.reps}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Weight: ${val.weight} lb</div>
      <br>
      <div>`
    );
  }

  updateList() {
    // rhit.upcomingWorkoutsManager.set(8, 5, 2023, "VLn6LxqYobJBl4Hfqnzf", "Y1OBxH2dz9ffFrM46Tw5m7kNXoK2", false)

    const newDay = htmlToElement(`<div id="daySelected"></div>`);
    const newList = htmlToElement(`<div id="upcomingList"></div>`);
    const newExp = htmlToElement(`<div id="expansion"></div>`);
    const oldDay = document.querySelector("#daySelected");
    const oldList = document.querySelector("#upcomingList");
    const oldExp = document.querySelector("#expansion");
    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {
        console.log(wp.name);
        this.exercisesManager = new rhit.ExercisesManager(wp.id);
        var newCard;
        var tmrw = new Date();
        var lastDay = wp.startDate.toDate();
        var content;
        lastDay.setDate(lastDay.getDate() + 1);
        const week = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        let j = 0;
        while (j < 1) {
          let exercises = rhit.exercisesManager.getExercisesFor(
            week[tmrw.getDay()]
          );
          if (exercises) {
            rhit.upcomingWorkoutsManager.set(
              tmrw.getDate(),
              tmrw.getMonth() + 1,
              tmrw.getFullYear(),
              wp.id,
              wp.uid,
              false
            );

            content = [Object.entries(exercises).length];
            j++;
            newCard = this._createCard(tmrw);
            newList.appendChild(newCard);
            const selectedDay = this._contentDay(tmrw);

            newCard.onclick = (event) => {
              let i = 0;
              for (const [key, value] of Object.entries(exercises)) {
                const getKey = key;
                const getVal = value;

                content[i] = this._contentCard(getKey, getVal);
                i++;
              }
              // if (document.querySelector("#appear")) {
              const collection = document.querySelectorAll("#appear");
              for (let i = 0; i < collection.length; i++) {
                collection[i].remove();
              }
              newDay.appendChild(selectedDay);
              // } else {
              for (let k = 0; k < Object.entries(exercises).length; k++) {
                newExp.appendChild(content[k]);
              }
              // }
            };
          }
          tmrw.setDate(tmrw.getDate() + 1);
        }
      }
    }

    oldExp.removeAttribute("id");
    oldExp.hidden = true;
    oldList.removeAttribute("id");
    oldList.hidden = true;
    oldDay.removeAttribute("id");
    oldDay.hidden = true;
    oldDay.parentElement.appendChild(newDay);
    oldExp.parentElement.appendChild(newExp);
    oldList.parentElement.appendChild(newList);
  }
};

rhit.MyAccountController = class {
  constructor() {
    document.querySelector("#signOutButton").onclick = (event) => {
      rhit.fbAuthManager.signOut();
      window.location.href = "/";
    };
  }
};

rhit.CustomPlanController = class {
  constructor(planId) {
    let day = "";
    document.querySelector("#monButton").onclick = (event) => {
      day = "Monday";
    };
    document.querySelector("#tueButton").onclick = (event) => {
      day = "Tuesday";
    };
    document.querySelector("#wedButton").onclick = (event) => {
      day = "Wednesday";
    };
    document.querySelector("#thuButton").onclick = (event) => {
      day = "Thursday";
    };
    document.querySelector("#friButton").onclick = (event) => {
      day = "Friday";
    };
    document.querySelector("#satButton").onclick = (event) => {
      day = "Saturday";
    };
    document.querySelector("#sunButton").onclick = (event) => {
      day = "Sunday";
    };
    document.querySelector("#submitAddCustom").onclick = (event) => {
      let exName;
      if (document.querySelector("#customName").value) {
        exName = document.querySelector("#customName").value;
      } else {
        // console.log(exName = document.querySelector("#exercise-names").innerHTML);
        var s = document.getElementsByName("exercise-names")[0];
        var text = s.options[s.selectedIndex].text;
        console.log(text);
        exName = text;
      }
      const sets = document.querySelector("#inputSets").value;
      const reps = document.querySelector("#inputReps").value;
      const weight = document.querySelector("#inputWeight").value;
      rhit.exercisesManager.update(day, exName, sets, reps, weight);
    };
    $("#addCustomDialog").on("show.bs.modal", (event) => {
      document.querySelector("#customName").value = "";
      document.querySelector("#inputSets").value = "";
      document.querySelector("#inputReps").value = "";
      document.querySelector("#inputWeight").value = "";
      // document.querySelector("#exercise-names").value = "custom";
      // document.getElementById("ifYes").style.display = "block";
    });

    document.querySelector("#customBack").onclick = (event) => {
      // window.location.href = "/myPlans.html";
      window.location.href = `/plan.html?id=${planId}`;
    };

    // document.querySelector("#customSetActive").onclick = (event) => {
    //   for (let i = 0; i < rhit.myPlansManager.length; i++) {
    //     const wp = rhit.myPlansManager.getPlanAtIndex(i);
    //     this.singlePlanManager = new rhit.SinglePlanManager(wp.id);

    //     if (wp.uid == rhit.fbAuthManager.uid) {
    //       if (wp.id === planId) {
    //         this.singlePlanManager.setFav(true);
    //       }
    //       else {
    //         this.singlePlanManager.setFav(false);
    //       }
    //     }
    //   }
    //   alert("This plan has been set has active");
    // };
    rhit.exercisesManager.beginListening(this.updateList.bind(this));

    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(key, val) {
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="excard">
        <h5 class="extitle">${key}</h5>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Sets: ${val.sets}</p>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Reps: ${val.reps}</p>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Weight: ${val.weight} lb</p>
        
      </div>
    </div>`
    );
    // <button id="edit${key}" type="button" class="btn bmd-btn-fab" data-toggle="modal" data-target="#addCustomDialog">
    //     <i class="material-icons">edit</i>
    //     </button>
    //     <button id="delete${key}" type="button" class="btn bmd-btn-fab" data-toggle="modal" data-target="#addCustomDialog">
    //     <i class="material-icons">delete</i>
    //     </button>
    // <input type="radio" id="favorite" name="fav_plan" value="${wp.name}">
    //     <label for="favorite">Favorite</label><br></br>
  }

  updateList() {
    let day = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let oldList = "";
    let newList = "";
    for (let i = 0; i < day.length; i++) {
      if (day[i] === "Monday") {
        console.log("working");
        oldList = document.querySelector("#monList");
        newList = htmlToElement(`<div id="monList"></div>`);
      } else if (day[i] === "Tuesday") {
        oldList = document.querySelector("#tueList");
        newList = htmlToElement(`<div id="tueList"></div>`);
      } else if (day[i] === "Wednesday") {
        oldList = document.querySelector("#wedList");
        newList = htmlToElement(`<div id="wedList"></div>`);
      } else if (day[i] === "Thursday") {
        oldList = document.querySelector("#thuList");
        newList = htmlToElement(`<div id="thuList"></div>`);
      } else if (day[i] === "Friday") {
        oldList = document.querySelector("#friList");
        newList = htmlToElement(`<div id="friList"></div>`);
      } else if (day[i] === "Saturday") {
        oldList = document.querySelector("#satList");
        newList = htmlToElement(`<div id="satList"></div>`);
      } else if (day[i] === "Sunday") {
        oldList = document.querySelector("#sunList");
        newList = htmlToElement(`<div id="sunList"></div>`);
      }

      // console.log(rhit.exercisesManager.getExercisesFor('Monday'));

      let exercises = rhit.exercisesManager.getExercisesFor(day[i]);
      if (exercises) {
        for (const [key, value] of Object.entries(exercises)) {
          console.log(key, value);
          // const wp = [key, value];
          const getKey = key;
          const getVal = value;
          // console.log([key, value]);
          const newCard = this._createCard(getKey, getVal);
          newCard.onclick = (event) => {
            // window.location.href = `/plan.html?id=${wp.id}`;
          };
          newList.appendChild(newCard);
          // if (wp.uid == rhit.fbAuthManager.uid) {
          //   console.log("working");
          // }
        }

        oldList.removeAttribute("id");
        oldList.hidden = true;

        oldList.parentElement.appendChild(newList);
      }
    }
  }
};

rhit.HomePageController = class {
  constructor() {
    document.querySelector("#workoutStreak").onclick = (event) => {
      // window.location.href = "/Calendar.html";
    };
    document.querySelector("#myPlansbtn").onclick = (event) => {
      window.location.href = "/myPlans.html";
    };
    document.querySelector("#mapbtn").onclick = (event) => {
      window.location.href = "/map.html";
    };
    document.querySelector("#signbtn").onclick = (event) => {
      rhit.fbAuthManager.signOut();
      window.location.href = "/";
    };

    // document.querySelector("#logbtn").onclick = (event) => {
    //   window.location.href = `/workoutLog.html`;
    //   // window.location.href = `/plan.html?id=${wp.id}`;
    // };
    // document.querySelector("#settingsbtn").onclick = (event) => {
    //   window.location.href = "/account.html";
    // };
    this.updateView();
    rhit.myPlansManager.beginListening(this.updateView.bind(this));
    rhit.pastWorkoutsManager.beginListening(this.updateView.bind(this));
  }

  updateView() {
    for (let i = 0; i < rhit.pastWorkoutsManager.length; i++) {
      const wp = rhit.pastWorkoutsManager.getUpcomingAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid) {
        if (wp.complete == true) {
          streak++;
          console.log(streak);
        } else {
          break;
        }
      }
    }
    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {
        document.querySelector("#logbtn").onclick = (event) => {
          window.location.href = `/upcomingWorkouts.html?id=${wp.id}`;
          // window.location.href = `/plan.html?id=${wp.id}`;
        };
        document.querySelector("#prevbtn").onclick = (event) => {
          window.location.href = `/previousWorkouts.html?id=${wp.id}`;
        };
        document.querySelector("#TodaysWorkout").onclick = (event) => {
          window.location.href = `/todaysWorkout.html?id=${wp.id}`;
        };
      }
    }
    let date = new Date().toUTCString().slice(5, 16);
    document.querySelector("#dateLabel").innerHTML = `${date}`;
    document.querySelector(
      "#streakText"
    ).innerHTML = `You've Completed Your Last <br> ${streak} <br> Workouts`;
  }
};

rhit.UpcomingWorkoutsController = class {
  constructor() {
    rhit.exercisesManager.beginListening(this.updateList.bind(this));
    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(prev) {
    // console.log(wp.name);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // console.log(prev.getDay());
    return htmlToElement(
      ` <button type="button" id="future" class="collapsible">${
        weekdays[prev.getDay()]
      }, ${
        months[prev.getMonth()]
      } ${prev.getDate()}, ${prev.getFullYear()}</button>
      <div id=expansion></div>`
    );
  }

  _contentDay(day) {
    // console.log(day);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return htmlToElement(
      `<h5 id="appear">&emsp;${weekdays[day.getDay()]}, ${
        months[day.getMonth()]
      } ${day.getDate()}, ${day.getFullYear()}</h5>`
    );
  }
  _contentCard(key, val) {
    return htmlToElement(
      `<div id="appear">
      <div>&emsp;&emsp;&emsp;Exercise: ${key}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Sets: ${val.sets}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Repetitions: ${val.reps}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Weight: ${val.weight} lb</div>
      <br>
      <div>`
    );
  }

  updateList() {
    // rhit.upcomingWorkoutsManager.set(8, 5, 2023, "VLn6LxqYobJBl4Hfqnzf", "Y1OBxH2dz9ffFrM46Tw5m7kNXoK2", false)

    const newDay = htmlToElement(`<div id="daySelected"></div>`);
    const newList = htmlToElement(`<div id="upcomingList"></div>`);
    const newExp = htmlToElement(`<div id="expansion"></div>`);
    const oldDay = document.querySelector("#daySelected");
    const oldList = document.querySelector("#upcomingList");
    const oldExp = document.querySelector("#expansion");
    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {
        console.log(wp.name);
        this.exercisesManager = new rhit.ExercisesManager(wp.id);
        var newCard;
        var tmrw = new Date();
        var lastDay = wp.startDate.toDate();
        var content;
        lastDay.setDate(lastDay.getDate() + 1);
        const week = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        let j = 0;
        while (j < 10) {
          let exercises = rhit.exercisesManager.getExercisesFor(
            week[tmrw.getDay()]
          );
          if (exercises) {
            rhit.upcomingWorkoutsManager.set(
              tmrw.getDate(),
              tmrw.getMonth() + 1,
              tmrw.getFullYear(),
              wp.id,
              wp.uid,
              false
            );

            content = [Object.entries(exercises).length];
            j++;
            newCard = this._createCard(tmrw);
            newList.appendChild(newCard);
            const selectedDay = this._contentDay(tmrw);

            newCard.onclick = (event) => {
              let i = 0;
              for (const [key, value] of Object.entries(exercises)) {
                const getKey = key;
                const getVal = value;

                content[i] = this._contentCard(getKey, getVal);
                i++;
              }
              // if (document.querySelector("#appear")) {
              const collection = document.querySelectorAll("#appear");
              for (let i = 0; i < collection.length; i++) {
                collection[i].remove();
              }
              newDay.appendChild(selectedDay);
              // } else {
              for (let k = 0; k < Object.entries(exercises).length; k++) {
                newExp.appendChild(content[k]);
              }
              // }
            };
          }
          tmrw.setDate(tmrw.getDate() + 1);
        }
      }
    }

    oldExp.removeAttribute("id");
    oldExp.hidden = true;
    oldList.removeAttribute("id");
    oldList.hidden = true;
    oldDay.removeAttribute("id");
    oldDay.hidden = true;
    oldDay.parentElement.appendChild(newDay);
    oldExp.parentElement.appendChild(newExp);
    oldList.parentElement.appendChild(newList);
  }
};

rhit.PastWorkoutsController = class {
  constructor() {
    this.lastSelected;
    rhit.exercisesManager.beginListening(this.updateList.bind(this));
    // rhit.myPlansManager.beginListening(this.updateList.bind(this));
    rhit.pastWorkoutsManager.beginListening(this.updateList.bind(this));
    rhit.upcomingWorkoutsManager.beginListening(this.updateList.bind(this));
    document.querySelector("#setComplete").onclick = (event) => {
      console.log(this.lastSelected.day);
      if (this.lastSelected.complete == false) {
        rhit.pastWorkoutsManager.set(
          this.lastSelected.day,
          this.lastSelected.month,
          this.lastSelected.year,
          this.lastSelected.plan,
          this.lastSelected.uid,
          true
        );

        // upcomingWorkoutsManager.set(wp)
        // this.lastSelected.complete = true;
        console.log("set true");
      } else {
        rhit.pastWorkoutsManager.set(
          this.lastSelected.day,
          this.lastSelected.month,
          this.lastSelected.year,
          this.lastSelected.plan,
          this.lastSelected.uid,
          false
        );
        console.log("set false");
      }
      // window.location.href = "myPlans.html";
    };
  }
  _createFail(prev) {
    // console.log(wp.name);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // console.log(prev.getDay());
    return htmlToElement(
      ` <button type="button" id="fail" class="collapsible">${
        weekdays[prev.getDay()]
      }, ${
        months[prev.getMonth()]
      } ${prev.getDate()}, ${prev.getFullYear()}</button>
      <div id=expansion></div>`
    );
  }
  _createCard(prev) {
    // console.log(wp.name);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // console.log(prev.getDay());
    return htmlToElement(
      ` <button type="button" id="complete" class="collapsible">${
        weekdays[prev.getDay()]
      }, ${
        months[prev.getMonth()]
      } ${prev.getDate()}, ${prev.getFullYear()}</button>
      <div id=expansion></div>`
    );
  }

  _contentDay(day) {
    // console.log(day);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return htmlToElement(
      `<h5 id="appear">&emsp;${weekdays[day.getDay()]}, ${
        months[day.getMonth()]
      } ${day.getDate()}, ${day.getFullYear()}</h5>`
    );
  }
  _contentCard(key, val) {
    return htmlToElement(
      `<div id="appear">
      <div>&emsp;&emsp;&emsp;Exercise: ${key}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Sets: ${val.sets}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Repetitions: ${val.reps}</div>
      <div>&emsp;&emsp;&emsp;&emsp;Weight: ${val.weight} lb</div>
      <br>
      <div>`
    );
  }

  updateList() {
    // let lastSelected;
    // rhit.upcomingWorkoutsManager.set(wp.day, wp.month, wp.year, wp.plan, wp.uid)
    // console.log("object");
    const newDay = htmlToElement(`<div id="daySelected"></div>`);
    const newList = htmlToElement(`<div id="pastList"></div>`);
    const newExp = htmlToElement(`<div id="expansion"></div>`);
    const oldDay = document.querySelector("#daySelected");
    const oldList = document.querySelector("#pastList");
    const oldExp = document.querySelector("#expansion");
    // rhit.pastWorkoutsManager

    for (let i = 0; i < rhit.upcomingWorkoutsManager.length; i++) {
      const wp = rhit.upcomingWorkoutsManager.getUpcomingAtIndex(i);
      let curDay = new Date(`${wp.year}/${wp.month}/${wp.day}`);
      let today = new Date();
      // console.log(curDay);
      // console.log(curDay < today);
      if (wp.uid == rhit.fbAuthManager.uid && curDay < today) {
        // console.log("hi");

        rhit.pastWorkoutsManager.set(
          wp.day,
          wp.month,
          wp.year,
          wp.plan,
          wp.uid,
          false
        );
        rhit.upcomingWorkoutsManager.delete(wp);
      }
    }

    // console.log(rhit.pastWorkoutsManager.length);

    for (let i = 0; i < rhit.pastWorkoutsManager.length; i++) {
      const wp = rhit.pastWorkoutsManager.getUpcomingAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid) {
        this.exercisesManager = new rhit.ExercisesManager(wp.plan);
        // this.exercisesManager.beginListening(this.updateList.bind(this));
        // wp.id
        var newCard;
        // var prevMonday = new Date();
        // var tmrw = new Date();
        var past = new Date(`${wp.year}/${wp.month}/${wp.day}`);
        console.log(wp.id);
        // console.log(past);
        // var lastDay = wp.startDate.toDate();
        var content;
        // lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 7));
        // lastDay.setDate(lastDay.getDate() + 1);
        const week = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // let j = 0;
        // while (j < 10) {
        let exercises = rhit.exercisesManager.getExercisesFor(
          week[past.getDay()]
        );
        // console.log(exercises);
        if (exercises) {
          content = [Object.entries(exercises).length];
          // j++;
          // console.log(content);
          if (wp.complete) {
            newCard = this._createCard(past);
          } else {
            newCard = this._createFail(past);
          }
          newList.appendChild(newCard);
          const selectedDay = this._contentDay(past);

          newCard.onclick = (event) => {
            this.lastSelected = wp;
            console.log(this.lastSelected.day);
            let i = 0;
            for (const [key, value] of Object.entries(exercises)) {
              const getKey = key;
              const getVal = value;

              content[i] = this._contentCard(getKey, getVal);
              i++;
            }
            // if (document.querySelector("#appear")) {
            const collection = document.querySelectorAll("#appear");
            for (let i = 0; i < collection.length; i++) {
              collection[i].remove();
            }
            newDay.appendChild(selectedDay);
            // } else {
            for (let k = 0; k < Object.entries(exercises).length; k++) {
              newExp.appendChild(content[k]);
            }
            // }
          };
        }
        // tmrw.setDate(tmrw.getDate() - 1);
      }
      // }
    }

    oldExp.removeAttribute("id");
    oldExp.hidden = true;
    oldList.removeAttribute("id");
    oldList.hidden = true;
    oldDay.removeAttribute("id");
    oldDay.hidden = true;
    oldDay.parentElement.appendChild(newDay);
    oldExp.parentElement.appendChild(newExp);
    oldList.parentElement.appendChild(newList);
  }
};

rhit.ExistingPlansController = class {
  constructor() {
    document.querySelector("#existingDone").onclick = (event) => {
      window.location.href = "/myPlans.html";
    };

    rhit.existingPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(wp) {
    console.log(wp.name);
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card">
        <h5 class="card-title">${wp.name}</h5>
        <h6 class="subtitle">${wp.level}</h6>
        <h6 class="subtitle">${wp.sessions} days per week</h6>
        <h6 class="subtitle">goal: ${wp.goal}</h6>
        <a href="#" class="card-link">Add</a>
      </div>
    </div>`
    );
  }

  updateList() {
    const newList = htmlToElement(`<div id="existingPlansList"></div>`);

    for (let i = 0; i < rhit.existingPlansManager.length; i++) {
      const wp = rhit.existingPlansManager.getPlanAtIndex(i);
      if (wp.uid == "") {
        const newCard = this._createCard(wp);

        newCard.onclick = (event) => {
          console.log(wp.exercises);
          rhit.existingPlansManager.addExisting(wp, new Date());
          alert("Plan added");
        };

        newList.appendChild(newCard);
      }
    }

    const oldList = document.querySelector("#existingPlansList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }
};

rhit.MapPageController = class {
  constructor() {
    this.imgID = "mapimage";
    this.resultID = "resultimage"

    //Section description buttons
    document.querySelector("#dumbellBtn").onclick = (event) => {
      document.querySelector("#sectionName").innerHTML = "Dumbell Rack";
      document.querySelector("#sectionImage").src =
        "images/wImage-dumbells.jpg";
      document.querySelector("#sectionDesc").innerHTML =
        "This area has dumbells and freeweight benches.";
    };
    document.querySelector("#squatBtn").onclick = (event) => {
      document.querySelector("#sectionName").innerHTML = "Squat Racks";
      document.querySelector("#sectionImage").src = "images/wImage-squat.jpg";
      document.querySelector("#sectionDesc").innerHTML =
        "This area has squat racks for squatting, benching, and other barbell exercises.";
    };
    document.querySelector("#cardioBtn").onclick = (event) => {
      document.querySelector("#sectionName").innerHTML = "Cardio room";
      document.querySelector("#sectionImage").src = "images/wImage-cardio.jpg";
      document.querySelector("#sectionDesc").innerHTML =
        "This area has some assorted weight machines and a variety of cardio machines";
    };
    document.querySelector("#assortedBtn").onclick = (event) => {
      document.querySelector("#sectionName").innerHTML = "Assorted Machines";
      document.querySelector("#sectionImage").src =
        "images/wImage-assorted.jpg";
      document.querySelector("#sectionDesc").innerHTML =
        "This area has assorted weight machines";
    };

    //Start map
    this.imageZoom();
  }
  imageZoom() {
    // Get map and zoom elements
    let map = document.getElementById(this.imgID);
    let zoomResult = document.getElementById(this.resultID);

    console.log(map);
    console.log(zoomResult);

    //Create lens element and insert it
    let lens = document.createElement("DIV");
    lens.setAttribute("class", "zoom-lens");
    map.parentElement.insertBefore(lens, map);

    //Calculate the size ratio between map and zoomResult
    let cx = zoomResult.offsetWidth / lens.offsetWidth;
    let cy = zoomResult.offsetHeight / lens.offsetHeight;
    // clg("x ratio: " + cx + ", y ratio: cy");

    //Set zoom box background image and size
    zoomResult.style.backgroundImage = "url('" + map.src + "')";
    zoomResult.style.backgroundSize =
      map.width * cx + "px " + map.height * cy + "px";

    //Call functions to move lend with cursor
    lens.addEventListener("mousemove", moveLens);
    map.addEventListener("mousemove", moveLens);
    lens.addEventListener("touchmove", moveLens);
    map.addEventListener("touchmove", moveLens);

    //functions from https://www.w3schools.com/howto/howto_js_image_zoom.asp
    function moveLens(e) {
      e.preventDefault();

      //Get position of the cursor and lens
      let pos = getCursorPos(e);
      let x = pos.x - lens.offsetWidth / 2;
      let y = pos.y - lens.offsetHeight / 2;

      //Bounds checking
      if (x > map.width - lens.offsetWidth) {
        x = map.width - lens.offsetWidth;
      }
      if (x < 0) {
        x = 0;
      }
      if (y > map.height - lens.offsetHeight) {
        y = map.height - lens.offsetHeight;
      }
      if (y < 0) {
        y = 0;
      }
      /* Set the position of the lens: */
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      
      //Sets the zoom box to display the same position as the lens
      zoomResult.style.backgroundPosition =
        "-" + x * cx + "px -" + y * cy + "px";
    }
    function getCursorPos(e) {
      var a,
        x = 0,
        y = 0;
      e = e || window.event;
      a = map.getBoundingClientRect();
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      return { x: x, y: y };
    }
  }
};

//
// MAIN
//
rhit.main = function () {
  rhit.fbAuthManager = new rhit.FBAuthManager();
  rhit.fbAuthManager.beginListening();
  rhit.myPlansManager = new rhit.MyPlansManager();
  rhit.upcomingWorkoutsManager = new rhit.UpcomingWorkoutsManager();
  rhit.pastWorkoutsManager = new rhit.PastWorkoutsManager();

  // rhit.myPlansManager.beginListening(updateList());
  if (document.querySelector("#loginPage")) {
    this.fbAuthManager.startFirebaseUI();
  }
  if (document.querySelector("#homePage")) {
    new rhit.HomePageController();
  }
  if (document.querySelector("#accountPage")) {
    new rhit.MyAccountController();
  }
  if (document.querySelector("#pastPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.exercisesManager = new rhit.ExercisesManager(planId);
    // this.pastWorkoutsManager = new rhit.PastWorkoutsManager();
    new rhit.PastWorkoutsController();
  }
  if (document.querySelector("#upcomingPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.exercisesManager = new rhit.ExercisesManager(planId);
    // this.upcomingWorkoutsManager = new rhit.UpcomingWorkoutsManager();

    new rhit.UpcomingWorkoutsController();
  }
  if (document.querySelector("#plansPage")) {
    new rhit.MyPlansController();
  }
  if (document.querySelector("#customPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }

    this.exercisesManager = new rhit.ExercisesManager(planId);

    new rhit.CustomPlanController(planId);
  }
  if (document.querySelector("#existingPage")) {
    this.existingPlansManager = new rhit.ExistingPlansManager();
    new rhit.ExistingPlansController();
  }
  if (document.querySelector("#planPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.singlePlanManager = new rhit.SinglePlanManager(planId);
    new rhit.SinglePlanController(planId);
  }
  if (document.querySelector("#todayPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.exercisesManager = new rhit.ExercisesManager(planId);
    new rhit.NextWorkoutController();
  }
  if (document.querySelector("#mapPage")) {
    new rhit.MapPageController();
  }
};

rhit.main();
