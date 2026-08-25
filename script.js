import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// 관리자 ID
const ADMIN_ID = "adbabdaqpapq";

const writeButton =
    document.getElementById("write-button");

const userArea =
    document.getElementById("user-area");

const searchInput =
    document.getElementById("search-input");

const searchButton =
    document.getElementById("search-button");

const sortSelect =
    document.getElementById("sort-select");


// 현재 게시글 목록
let allPosts = [];


// 로그인 상태 확인
onAuthStateChanged(auth, function(user) {

    if (user) {

        userArea.innerHTML = "";

        const userText =
            document.createElement("span");

        const userId =
            user.email.split("@")[0];

        userText.textContent =
            "로그인: " + userId;

        const logoutButton =
            document.createElement("button");

        logoutButton.textContent =
            "로그아웃";

        logoutButton.addEventListener(
            "click",
            async function() {

                try {

                    await signOut(auth);

                    alert("로그아웃되었습니다.");

                    location.reload();

                } catch (error) {

                    console.error(
                        "로그아웃 오류:",
                        error
                    );

                }

            }
        );

        userArea.appendChild(userText);
        userArea.appendChild(logoutButton);

        writeButton.style.display =
            "inline-block";

    } else {

        userArea.innerHTML = "";

        const loginButton =
            document.createElement("button");

        loginButton.textContent =
            "로그인";

        loginButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "login.html";

            }
        );


        // 회원가입 버튼 (로그인 버튼 바로 옆)
        const signupButton =
            document.createElement("button");

        signupButton.textContent =
            "회원가입";

        signupButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "signup.html";

            }
        );


        userArea.appendChild(
            loginButton
        );

        userArea.appendChild(
            signupButton
        );

        writeButton.style.display =
            "none";
    }

});


// 글쓰기 버튼
writeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "write.html";

    }
);


// 게시글 불러오기
async function loadPosts() {

    try {

        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "posts"
                )
            );

        allPosts = [];

        querySnapshot.forEach(
            function(postDoc) {

                allPosts.push({
                    id: postDoc.id,
                    ...postDoc.data()
                });

            }
        );


        // 기본 정렬은 최신순
        renderPosts();

    } catch (error) {

        console.error(
            "게시글 불러오기 오류:",
            error
        );

    }

}


// 게시글 표시
function renderPosts() {

    const postList =
        document.getElementById(
            "post-list"
        );

    postList.innerHTML = "";


    // 현재 정렬 방식
    const sortType =
        sortSelect.value;


    // 원본 배열을 건드리지 않도록 복사
    const sortedPosts =
        [...allPosts];


    // 최신순
    if (sortType === "latest") {

        sortedPosts.sort(
            function(a, b) {

                const timeA =
                    a.createdAt
                        ? a.createdAt.toMillis()
                        : 0;

                const timeB =
                    b.createdAt
                        ? b.createdAt.toMillis()
                        : 0;

                // 최신 글이 위로
                return timeB - timeA;

            }
        );

    }


    // 인기순
    else if (sortType === "popular") {

        sortedPosts.sort(
            function(a, b) {

                const likesA =
                    a.likesCount || 0;

                const likesB =
                    b.likesCount || 0;

                return likesB - likesA;

            }
        );

    }


    // 조회수순
    else if (sortType === "views") {

        sortedPosts.sort(
            function(a, b) {

                const viewsA =
                    a.views || 0;

                const viewsB =
                    b.views || 0;

                return viewsB - viewsA;

            }
        );

    }


    // 검색어
    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    sortedPosts.forEach(
        function(post) {

            // 검색어가 있으면 제목 검색
            if (
                searchText !== "" &&
                !post.title
                    .toLowerCase()
                    .includes(searchText)
            ) {

                return;

            }


            // 게시글 전체 영역
            const postWrapper =
                document.createElement("div");

            postWrapper.className =
                "post-wrapper";


            // 게시글 테두리
            const postElement =
                document.createElement("div");

            postElement.className =
                "post-item";


            // 제목 + 오른쪽 정보
            const postHeader =
                document.createElement("div");

            postHeader.className =
                "post-header";


            // 제목
            const titleElement =
                document.createElement("h3");

            titleElement.textContent =
                post.title;

            titleElement.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "post.html?id=" +
                        post.id;

                }
            );


            // 오른쪽 정보 영역
            const postInfo =
                document.createElement("div");

            postInfo.className =
                "post-info";


            // 날짜
            const dateElement =
                document.createElement("span");

            dateElement.className =
                "post-date";


            if (post.createdAt) {

                const date =
                    post.createdAt.toDate();

                const year =
                    date.getFullYear();

                const month =
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        date.getDate()
                    ).padStart(2, "0");

                const hours =
                    String(
                        date.getHours()
                    ).padStart(2, "0");

                const minutes =
                    String(
                        date.getMinutes()
                    ).padStart(2, "0");

                dateElement.textContent =
                    `${year}/${month}/${day}-${hours}:${minutes}`;

            }


            // 조회수
            const viewElement =
                document.createElement("span");

            viewElement.className =
                "post-view-count";

            viewElement.textContent =
                "조회 " +
                (post.views || 0);


            postInfo.appendChild(
                dateElement
            );

            postInfo.appendChild(
                viewElement
            );


            postHeader.appendChild(
                titleElement
            );

            postHeader.appendChild(
                postInfo
            );


            postElement.appendChild(
                postHeader
            );


            postWrapper.appendChild(
                postElement
            );


            // 관리자 삭제 버튼
            const user =
                auth.currentUser;

            if (user) {

                const userId =
                    user.email.split("@")[0];

                if (
                    userId === ADMIN_ID
                ) {

                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.textContent =
                        "삭제";

                    deleteButton.className =
                        "post-delete-button";


                    deleteButton.addEventListener(
                        "click",
                        async function(event) {

                            event.stopPropagation();


                            const confirmed =
                                confirm(
                                    "이 게시글과 모든 댓글을 삭제할까요?"
                                );


                            if (!confirmed) {

                                return;

                            }


                            try {

                                // 댓글 삭제
                                const commentsRef =
                                    collection(
                                        db,
                                        "posts",
                                        post.id,
                                        "comments"
                                    );

                                const commentsSnapshot =
                                    await getDocs(
                                        commentsRef
                                    );


                                for (
                                    const commentDoc
                                    of commentsSnapshot.docs
                                ) {

                                    await deleteDoc(
                                        commentDoc.ref
                                    );

                                }


                                // 게시글 삭제
                                await deleteDoc(
                                    doc(
                                        db,
                                        "posts",
                                        post.id
                                    )
                                );


                                // 화면에서 제거
                                allPosts =
                                    allPosts.filter(
                                        function(item) {

                                            return (
                                                item.id !==
                                                post.id
                                            );

                                        }
                                    );


                                renderPosts();


                            } catch (error) {

                                console.error(
                                    "게시글 삭제 오류:",
                                    error
                                );

                                alert(
                                    "게시글 삭제에 실패했습니다."
                                );

                            }

                        }
                    );


                    postWrapper.appendChild(
                        deleteButton
                    );

                }

            }


            postList.appendChild(
                postWrapper
            );

        }
    );

}


// 정렬 변경
sortSelect.addEventListener(
    "change",
    function() {

        renderPosts();

    }
);


// 검색
searchButton.addEventListener(
    "click",
    function() {

        renderPosts();

    }
);


// 게시글 불러오기
loadPosts();
