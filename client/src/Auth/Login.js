import SignUp from "./SignUp.js";

class Login {
    constructor() {
        this.universityDropdown = document.querySelector('.selectUniLOG');
        this.courseDropdown = document.querySelector('.selectCourseLOG');
        this.btnLogin = document.querySelector('#submitLOG')
        this.inputUsername = document.querySelector('#usernameLOG')
    }

    init() {
        SignUp.prototype.initializeDropdownValues("ListOfUniversities", this.universityDropdown)
        SignUp.prototype.initializeDropdownValues("ListOfCourses", this.courseDropdown)
        SignUp.prototype.KeyPressEvent(this.inputUsername, this.logUserIn.bind(this))
        this.btnLogin.addEventListener('click', this.logUserIn.bind(this))
    }

    async logUserIn() {
        const userDetails = {
            username: this.inputUsername.value,
            universityID: this.universityDropdown.value,
            courseID: this.courseDropdown.value,
            checkUsernameOnly: false
        }
        const userCheck = await SignUp.prototype.checkUsername(userDetails)

        if (userCheck.message === 'success') {
            window.location = `/upload.html`;
        } else {
            warnLOG.textContent = userCheck.message;
            usernameLOG.value = '';
        }
    }
}
const LoginClass = new Login();
const SignUpForm = new SignUp();

LoginClass.init();
SignUpForm.init();