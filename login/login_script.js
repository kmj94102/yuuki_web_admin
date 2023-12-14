import { emailLogin } from '../firebase.js'

document.getElementById('buttonLogin').addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const user = await emailLogin(email, password);
    if(user) {
        window.location.href = "../index.html";
    }
});