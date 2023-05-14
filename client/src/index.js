const nameInput = document.querySelector('#name');
const usernameInput = document.querySelector('#username');
const submit = document.querySelector('#submit');
const suggestion = document.querySelector('#suggestion');
const suggest = document.querySelector('#suggest');
const warn = document.querySelector('#warn');
const loginLink = document.querySelector('#loginLink');
const selectUni = document.querySelector('.selectUni');
const selectCourse = document.querySelector('.selectCourse');

// checks for any length of empty string
const emptySpaceChecker = /^ *$/;

// validates all the input fields before signing up
async function validate() {
  const name = nameInput.value.trim();
  const user = {
    userID: null,
    username: usernameInput.value.trim(),
    fullName: name.substring(0, 1).toUpperCase() + name.substring(1),
    universityID: selectUni.value,
    courseID: selectCourse.value,
    points: 0
  };
  if (emptySpaceChecker.test(user.name) || emptySpaceChecker.test(user.username)) {
    makeRedBorder(nameInput, usernameInput);
    warn.textContent = 'Field missing';
    return false;
  } if (await checkUsername(user.username) === false) {
    warn.textContent = 'username already exists';
    return false;
  } else {
    const response = await fetch('ListOfUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    warn.textContent = '';
    nameInput.value = '';
    usernameInput.value = '';
    replaceLoginField();
  }
}

// Suggests a suitable username
let interval;
let random;
let char;
usernameInput.addEventListener('focus', () => {
  if (emptySpaceChecker.test(nameInput.value)) {
    nameInput.style.borderColor = 'red';
  } else {
    suggestion.style.display = 'block';
    suggest.style.display = 'block';
    random = Math.round(Math.random() * 10000);
    char = nameInput.value.split(' ')[0].trim();
    suggestion.textContent = char + random;
    interval = setInterval(() => {
      random = Math.round(Math.random() * 10000);
      char = nameInput.value.split(' ')[0].trim();
      suggestion.textContent = char + random;
    }, 2000);
  }
});

suggestion.addEventListener('click', () => {
  usernameInput.value = suggestion.textContent;
  clearInterval(interval);
  suggestion.style.display = 'none';
  suggest.style.display = 'none';
  usernameInput.style.borderColor = 'grey';
});

async function checkUsername(username) {
  const response = await fetch('ListOfUsers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(username)
  });
  if (response.ok) {
    return true
  }
}

// If any of input field missing value
function makeRedBorder(name, username) {
  if (emptySpaceChecker.test(name.value)) {
    name.style.borderColor = 'red';
  }
  if (emptySpaceChecker.test(username.value)) {
    username.style.borderColor = 'red';
  }
}

// when user has field missing, when they start adding data then field border goes back to grey
function greyBorder(elem) {
  elem.addEventListener('input', () => {
    if (elem.value.length > 1) {
      elem.style.borderColor = 'grey';
    } if (elem.value.length >= 5) {
      elem.style.borderColor = 'grey';
      warn.textContent = '';
    }
  });
}


// replaces sign up content with login content
function replaceLoginField() {
  const top = document.querySelector('.top');
  const main = document.querySelector('.main');
  const loginDiv = document.querySelector('.loginDiv');

  if (loginLink.textContent === ' Login ') {
    main.style.display = 'none';
    top.appendChild(loginDiv);
    loginDiv.style.display = 'block';
    loginDiv.style.paddingBottom = '60px';
    loginLink.textContent = 'Sign up';
  } else {
    loginDiv.style.display = 'none';
    main.style.display = 'block';
    loginLink.textContent = ' Login ';
  }
}
loginLink.addEventListener('click', replaceLoginField);

// Validates LOGIN details
const usernameLOG = document.querySelector('#usernameLOG');
const selectUniLOG = document.querySelector('.selectUniLOG');
const selectCourseLOG = document.querySelector('.selectCourseLOG');
const submitLOG = document.querySelector('#submitLOG');
const warnLOG = document.querySelector('#warnLOG');

submitLOG.addEventListener('click', logUserIn);

async function logUserIn() {
  const response = await fetch('ListOfUsers');
  if (response.ok) {
    const users = await response.json();
    let currentUser;
    const client = {
      username: usernameLOG.value,
      university: selectUniLOG.value,
      course: selectCourseLOG.value
    };
    let exist = false;
    for (const user of users) {
      if (client.username === user.username && client.university === user.university && client.course === user.course) {
        exist = true;
        currentUser = user;
      }
    }
    if (!exist) {
      warnLOG.textContent = 'Incorrect details entered';
      usernameLOG.value = '';
    } else {
      const user = { id: currentUser.id, status: 'in' };
      localStorage.setItem('user', JSON.stringify(user));
      window.location = `/upload.html#${currentUser.id}`;
    }
  }
}

function callIt(div, func) {
  div.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      func()
    }
  });
}

async function initialiseUniValues(elemID) {
  const elem = document.querySelector(elemID);
  const listOfUniversities = await GetAPIData("ListOfUniversities")
  console.log(listOfUniversities)
  listOfUniversities.forEach(university => {
      const optionElement = document.createElement('option');
      optionElement.value = university.UniversityID  
      optionElement.textContent = university.UniFullName
      elem.appendChild(optionElement)
    });
}

async function initialiseCourseValues(elemID) {
  const elem = document.querySelector(elemID);
  const listOfCourses = await GetAPIData("ListOfCourses")
  console.log(listOfCourses)
  listOfCourses.forEach(course => {
      const optionElement = document.createElement('option');
      optionElement.value = course.CourseID  
      optionElement.textContent = course.CourseFullName
      elem.appendChild(optionElement)
    });
}



async function GetAPIData(path) {
  const response = await fetch(path);
  if (response.ok) {
    const data = await response.json();
    return data
  }
  throw Error("Could not get data for path: ", path);
}

function init() {
  initialiseUniValues(".selectUni");
  initialiseCourseValues(".selectCourse");
  initialiseUniValues(".selectUniLOG");
  initialiseCourseValues(".selectCourseLOG");
  callIt(usernameLOG, logUserIn);
  callIt(usernameInput, validate);
  submit.addEventListener('click', validate);
  greyBorder(nameInput);
  greyBorder(usernameInput);
}
init()
