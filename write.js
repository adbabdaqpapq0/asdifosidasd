import { db, auth } from "../firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const postButton =
    document.getElementById("post-button");


postButton.addEventListener(
    "click",
    async function() {

        const title =
            document.getElementById(
                "post-title"
            ).value.trim();

        const content =
            document.getElementById(
                "post-content"
            ).value.trim();


        if (
            title === ""
            || content === ""
        ) {

            alert(
                "제목과 내용을 입력해주세요."
            );

            return;
        }


        // 로그인 확인
        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "로그인 후 게시글을 작성할 수 있습니다."
            );

            window.location.href =
                "login.html";

            return;
        }


        try {

            // 현재 로그인한 사용자의 정보 가져오기
            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                alert(
                    "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
                );

                return;
            }


            const userData =
                userSnapshot.data();


            const nickname =
                userData.nickname;


            if (!nickname) {

                alert(
                    "닉네임 정보를 찾을 수 없습니다."
                );

                return;
            }


            // 게시글 저장
            await addDoc(
                collection(
                    db,
                    "posts"
                ),
                {
                    title: title,
                    content: content,

                    // 작성자 정보
                    authorId: user.uid,
                    authorNickname: nickname,

                    createdAt:
                        serverTimestamp(),

                    // 조회수/좋아요 초기값
                    // (필드가 아예 없으면 Firestore 규칙에서
                    //  조회수/좋아요 증가 처리 시 문제가 생길 수 있어
                    //  처음부터 0으로 넣어둠)
                    views: 0,
                    likes: 0,

                    comments: []
                }
            );


            alert(
                "게시글이 등록되었습니다."
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "게시글 저장 오류:",
                error
            );


            alert(
                "게시글 등록에 실패했습니다."
            );

        }

    }
);
