import { auth, db } from "../firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const idInput =
    document.getElementById("user-id");

const passwordInput =
    document.getElementById("password");

const passwordToggleButton =
    document.getElementById("password-toggle-button");

const nicknameInput =
    document.getElementById("nickname");

const signupButton =
    document.getElementById("signup-button");

const backButton =
    document.getElementById("back-button");

const homeButton =
    document.getElementById("home-button");


function makeFirebaseEmail(userId) {

    return (
        userId.trim().toLowerCase()
        + "@yar-community.local"
    );

}


// 비밀번호 표시/숨기기 토글
passwordToggleButton.addEventListener(
    "click",
    function() {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordToggleButton.textContent =
                "숨기기";

        } else {

            passwordInput.type = "password";

            passwordToggleButton.textContent =
                "표시";

        }

    }
);


// 회원가입
signupButton.addEventListener(
    "click",
    async function() {

        const userId =
            idInput.value.trim();

        const password =
            passwordInput.value;

        const nickname =
            nicknameInput.value.trim();


        if (
            userId === ""
            || password === ""
            || nickname === ""
        ) {

            alert(
                "ID, 비밀번호, 닉네임을 모두 입력해주세요."
            );

            return;
        }


        if (userId.length < 4) {

            alert(
                "ID는 4자 이상 입력해주세요."
            );

            return;
        }


        if (password.length < 6) {

            alert(
                "비밀번호는 6자 이상 입력해주세요."
            );

            return;
        }


        try {

            const firebaseEmail =
                makeFirebaseEmail(userId);


            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    firebaseEmail,
                    password
                );


            const user =
                userCredential.user;


            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {
                    userId: userId,
                    nickname: nickname
                }
            );


            alert(
                "회원가입이 완료되었습니다."
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "회원가입 오류:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                alert(
                    "이미 사용 중인 ID입니다."
                );

            } else {

                alert(
                    "회원가입에 실패했습니다."
                );

            }

        }

    }
);


// 로그인 페이지로 이동
backButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "login.html";

    }
);


// 메인 화면으로 돌아가기
homeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);
