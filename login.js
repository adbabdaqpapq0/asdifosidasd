import { auth } from "../firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const idInput =
    document.getElementById("user-id");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("login-button");

const signupButton =
    document.getElementById("signup-button");

const backButton =
    document.getElementById("back-button");


function makeFirebaseEmail(userId) {

    return (
        userId.trim().toLowerCase()
        + "@yar-community.local"
    );

}


// 로그인
loginButton.addEventListener(
    "click",
    async function() {

        const userId =
            idInput.value.trim();

        const password =
            passwordInput.value;


        if (
            userId === ""
            || password === ""
        ) {

            alert(
                "ID와 비밀번호를 입력해주세요."
            );

            return;
        }


        try {

            const firebaseEmail =
                makeFirebaseEmail(userId);


            await signInWithEmailAndPassword(
                auth,
                firebaseEmail,
                password
            );


            alert(
                "로그인되었습니다."
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "로그인 오류:",
                error
            );


            alert(
                "ID 또는 비밀번호가 올바르지 않습니다."
            );

        }

    }
);


// 회원가입 페이지로 이동
signupButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "signup.html";

    }
);


// 메인 화면으로 돌아가기
backButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);
