var rhit = rhit || {};

let weekday = new Date().getDay();


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
      window.location.href = "file:///C:/Users/satkosb/Documents/logger/satkosb.github.io/home.html";
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
  }
};

rhit.SplitPageController = class {
  constructor() {

  }
}

rhit.DietPageController = class {
  constructor() {
    
  }
}

rhit.LogPageController = class {
  constructor() {
    
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
