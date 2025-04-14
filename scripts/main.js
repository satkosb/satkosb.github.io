var rhit = rhit || {};

let weekday = new Date().getDay();
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let todaysCals = 0;
let todaysProtein = 0;


function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

rhit.loginPageController = class{
  constructor() {
    document.querySelector("#signInBtn").onclick = (event) => {
      console.log("Button clicked");
      window.location.href = "home.html";
    }
  }
}

rhit.HomePageController = class {
  constructor() {
    document.querySelector("#mySplitBtn").onclick = (event)=> {
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/split.html";
    }
    document.querySelector("#TodaysWorkout").onclick = (event)=> {
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/log.html";
    }
    document.querySelector("#TodaysDiet").onclick = (event)=> {
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/diet.html";
    }
    document.querySelector("#dietBtn").onclick = (event)=> {
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/diet.html";
    }
    document.querySelector("#signBtn").onclick = (event)=> {
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/index.html";
    }
    this.updateView();
  }

  //TODO Change
  updateView() {
    document.getElementById("dateLabel").innerHTML = days[weekday - 1] + ": day";
    document.getElementById("daysCals").innerHTML = "Today: " + todaysCals + " cals";
  }
};

rhit.SplitPageController = class {
  constructor() {
    document.querySelector("#subDays").onclick =  (event) => {
      var numDays = document.getElementById("numDays").value;
      
      document.getElementById("getDays").remove();
      var index = 1;
      while (index <= numDays) {
        var exercise = htmlToElement("<div id='enter'><label for='d1'>Day " + index + ":</label><br><input type='text' id='d" + index + "'name='d" + index + "'><br><input id='submit' type='submit' value='Submit'></form></div>");
      document.getElementById("splitContainer").appendChild(exercise);
      index ++;
      }
      
    } 
  }
}

rhit.DietPageController = class {
  constructor() {
    document.getElementById("logCals").onclick = (event) => {
      var exercise = htmlToElement("<div id='enter'><h3>Food info</h3><label for='cals'>calories</label><br><input type='text' id='cals'name='cals'><br><label for='grams'>grams:</label><br><input type='text' id='grams' name='grams'><br><h3>Eaten:</h3><label for='eaten'>Grams:</label><br><input type='text' id='eaten' name='eaten'><br><input id='submitC' type='submit' value='Submit'></form> </form></div>");
      document.getElementById("dietContainer").appendChild(exercise);
      document.querySelector("#submitC").onclick = (event) => {
        var cpg = document.getElementById("cals").value / document.getElementById("grams").value;
        var caloriesEaten = Math.floor(document.getElementById("eaten").value / cpg);
        document.getElementById("enter").remove();
        todaysCals += caloriesEaten;
        document.getElementById("caloriesLabel").innerHTML = "Calories: " + todaysCals;
      }
        
    }
    document.getElementById("logProtein").onclick = (event) => {
      var exercise = htmlToElement("<div id='enter'><h3>Food info</h3><label for='prot'>protein</label><br><input type='text' id='prot'name='prot'><br><label for='grams'>grams:</label><br><input type='text' id='grams' name='grams'><br><h3>Eaten:</h3><label for='eaten'>Grams:</label><br><input type='text' id='eaten' name='eaten'><br><input id='submitP' type='submit' value='Submit'></form> </form></div>");
      document.getElementById("dietContainer").appendChild(exercise);
      document.querySelector("#submitP").onclick = (event) => {
        var ppg = document.getElementById("prot").value / document.getElementById("grams").value;
        var proteinEaten = Math.floor(document.getElementById("eaten").value / ppg);
        document.getElementById("enter").remove();
        todaysProtein += proteinEaten;
        document.getElementById("proteinLabel").innerHTML = "Protein: " + todaysProtein;
      }
    }
  }
}

rhit.LogPageController = class {
  constructor() {
    document.querySelector("#logExercise").onclick =  (event) => {
      var exercise = htmlToElement("<div id='enter'><label for='ename'>Exercise Name:</label><br><input type='text' id='ename'name='ename'><br><label for='weight'>Weight:</label><br><input type='text' id='weight' name='weight'><br><label for='sets'>Sets:</label><br><input type='text' id='sets' name='sets'><br><label for='reps'>Reps:</label><br><input type='text' id='reps' name='reps'><br><input id='submit' type='submit' value='Submit'></form> </form></div>");
      document.getElementById("exerciseContainer").appendChild(exercise);
      document.querySelector("#submit").onclick = (event) => {
        
        var exerciseName = document.getElementById("ename").value;
        var sets = document.getElementById("sets").value;;
        var reps = document.getElementById("reps").value;;
        var weight = document.getElementById("weight").value;;
        var eString = "<div class='container'><h5>" + exerciseName + "</h5><p> " + sets + " sets x " + reps + " reps  |  " + weight + " lbs</p><hr></div>";
        var newExercise = htmlToElement(eString);
        document.getElementById("enter").remove();
        document.getElementById("exerciseContainer").appendChild(newExercise);
      }
    } 
  }
}
//
// MAIN
//
rhit.main = function () {
  console.log(window.location.href);

  if (document.querySelector("#loginPage")){
    new rhit.loginPageController();
  }
  if (document.querySelector("#homePage")) {
    new rhit.HomePageController();
  }
  if (document.querySelector("#splitPage")) {
    new rhit.SplitPageController();
  }
  if (document.querySelector("#dietPage")) {
    new rhit.DietPageController();
  }
  if (document.querySelector("#logPage")) {
    new rhit.LogPageController();
  }
};

rhit.main();
