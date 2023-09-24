export default class SignUp {
    constructor() {
        this.nameInput = document.querySelector('#name');
        this.usernameInput = document.querySelector('#username');
        this.submit = document.querySelector('#submit');
        this.suggestion = document.querySelector('#suggestion');
        this.suggest = document.querySelector('#suggest');
        this.warn = document.querySelector('#warn');
        this.btnLoginSignup = document.querySelector('#loginLink');
        this.universityDropdown = document.querySelector('.selectUni');
        this.courseDropdown = document.querySelector('.selectCourse');
        this.top = document.querySelector('.top');
        this.main = document.querySelector('.main');
        this.loginDiv = document.querySelector('.loginDiv');
        this.emptySpaceChecker = /^ *$/;
    }

    init() {
        this.initializeDropdownValues("ListOfUniversities", this.universityDropdown);
        this.initializeDropdownValues("ListOfCourses", this.courseDropdown);
        this.submit.addEventListener('click', this.handleSubmit.bind(this))
        this.nameInput.addEventListener('input', this.inputGreyBorder.bind(this))
        this.usernameInput.addEventListener('input', this.inputGreyBorder.bind(this))
        this.btnLoginSignup.addEventListener('click', this.replaceLoginField.bind(this))
        this.KeyPressEvent(this.usernameInput, this.handleSubmit)
    }

    async initializeDropdownValues(endpoint, elem) {
        const data = await this.GetAPIData(endpoint);
        data.forEach(item => {
            const optionElement = document.createElement('option');
            optionElement.value = item.ID;
            optionElement.textContent = item.Name;
            elem.appendChild(optionElement);
        });
    }

    async validate() {
        const name = this.nameInput.value.trim();
        const user = {
            userID: null,
            username: this.usernameInput.value.trim(),
            fullName: name.substring(0, 1).toUpperCase() + name.substring(1),
            universityID: this.universityDropdown.value,
            courseID: this.courseDropdown.value,
            points: 0
        };
        const usernameCheck = await this.checkUsername({ username: user.username, checkUsernameOnly: true })
        if (this.emptySpaceChecker.test(user.name) || this.emptySpaceChecker.test(user.username)) {
            this.makeRedBorder(this.nameInput, this.usernameInput);
            warn.textContent = 'Field missing';
            return false;
        } if (usernameCheck.message !== 'success') {
            warn.textContent = usernameCheck.message;
            return false;
        } else {
            const response = await fetch('ListOfUsers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            this.warn.textContent = '';
            this.nameInput.value = '';
            this.usernameInput.value = '';
            this.replaceLoginField();
        }
    }

    async checkUsername(user) {
        const response = await fetch('/ListOfUsers/check-userDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const message = await response.json()
        return message
    }

    handleSubmit() {
        this.validate()
    }

    inputGreyBorder(event) {
        if (event.target.value.length > 1) {
            event.target.style.borderColor = 'grey';
        } if (event.target.value.length >= 5) {
            event.target.style.borderColor = 'grey';
            warn.textContent = '';
        }
    }

    KeyPressEvent(inputField, funcToCall) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                funcToCall()
            }
        });
    }

    async GetAPIData(endpoint) {
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            return data
        }
        throw Error("Could not get data for path: ", endpoint);
    }

    replaceLoginField() {
        if (this.btnLoginSignup.textContent === ' Login ') {
            this.main.style.display = 'none';
            this.top.appendChild(this.loginDiv);
            this.loginDiv.style.display = 'block';
            this.loginDiv.style.paddingBottom = '60px';
            this.btnLoginSignup.textContent = 'Sign up';
        } else {
            this.loginDiv.style.display = 'none';
            this.main.style.display = 'block';
            this.btnLoginSignup.textContent = ' Login ';
        }
    }

    // If any of input field missing value
    makeRedBorder(name, username) {
        if (this.emptySpaceChecker.test(name.value)) {
            name.style.borderColor = 'red';
        }
        if (this.emptySpaceChecker.test(username.value)) {
            username.style.borderColor = 'red';
        }
    }

}