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

const rankingList =
    document.getElementById("ranking-list");

const rankingUpdated =
    document.getElementById("ranking-updated");


// 현재 게시글 목록
let allPosts = [];


// 로그인 상태 확인
onAuthStateChanged(auth, function(user) {

    if (user) {

        userArea.innerHTML = "";

        const userId =
            user.email.split("@")[0];

        // 로그인 상태 영역 (아바타 + 닉네임 + 로그아웃)
        const userSummary =
            document.createElement("div");

        userSummary.className =
            "user-summary";


        const avatarButton =
            document.createElement("span");

        avatarButton.className =
            "avatar-button";

        avatarButton.textContent =
            userId.slice(0, 2).toUpperCase();

        avatarButton.title =
            "로그인: " + userId;


        const userName =
            document.createElement("span");

        userName.className =
            "user-name";

        userName.textContent =
            userId;


        const logoutButton =
            document.createElement("button");

        logoutButton.type =
            "button";

        logoutButton.className =
            "logout-button";

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

        userSummary.appendChild(avatarButton);
        userSummary.appendChild(userName);
        userSummary.appendChild(logoutButton);

        userArea.appendChild(userSummary);

        writeButton.style.display =
            "inline-flex";

    } else {

        userArea.innerHTML = "";

        // 로그아웃 상태 영역 (로그인 + 회원가입)
        const authControls =
            document.createElement("div");

        authControls.className =
            "auth-controls";


        const loginButton =
            document.createElement("button");

        loginButton.type =
            "button";

        loginButton.className =
            "login-button";

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

        signupButton.type =
            "button";

        signupButton.className =
            "signup-button";

        signupButton.textContent =
            "회원가입";

        signupButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "signup.html";

            }
        );


        authControls.appendChild(loginButton);
        authControls.appendChild(signupButton);

        userArea.appendChild(authControls);

        writeButton.style.display =
            "none";
    }

    // 로그인 상태가 바뀌면 삭제 버튼 노출 여부도 다시 그려줌
    renderPosts();

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
        renderRanking();

    } catch (error) {

        console.error(
            "게시글 불러오기 오류:",
            error
        );

    }

}


// 게시글 내용 일부만 미리보기로 잘라주는 함수
function makeExcerpt(content) {

    if (!content) {

        return "";

    }

    const oneLine =
        content
            .replace(/\s+/g, " ")
            .trim();

    if (oneLine.length <= 60) {

        return oneLine;

    }

    return oneLine.slice(0, 60) + "…";

}


// 날짜 포맷
function formatDate(timestamp) {

    if (!timestamp) {

        return "";

    }

    const date =
        timestamp.toDate();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    const hours =
        String(date.getHours())
            .padStart(2, "0");

    const minutes =
        String(date.getMinutes())
            .padStart(2, "0");

    return `${month}.${day} ${hours}:${minutes}`;

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
                    a.likes || 0;

                const likesB =
                    b.likes || 0;

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

    let visibleCount = 0;


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

            visibleCount++;


            // 게시글 한 줄 (제목/미리보기 · 날짜/조회수 · 더보기)
            const postRow =
                document.createElement("div");

            postRow.className =
                "post-row";


            // 제목 + 미리보기
            const postCopy =
                document.createElement("div");

            postCopy.className =
                "post-copy";


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


            const excerptElement =
                document.createElement("p");

            excerptElement.textContent =
                (post.authorNickname
                    ? post.authorNickname + " · "
                    : "") +
                makeExcerpt(post.content);


            postCopy.appendChild(titleElement);
            postCopy.appendChild(excerptElement);


            // 날짜 + 조회수
            const postMeta =
                document.createElement("div");

            postMeta.className =
                "post-meta";


            const dateElement =
                document.createElement("span");

            dateElement.textContent =
                formatDate(post.createdAt);


            const viewElement =
                document.createElement("span");

            viewElement.textContent =
                "조회 " + (post.views || 0);


            postMeta.appendChild(dateElement);
            postMeta.appendChild(viewElement);


            postRow.appendChild(postCopy);
            postRow.appendChild(postMeta);


            // 관리자 삭제 버튼 (더보기 자리)
            const user =
                auth.currentUser;

            if (user) {

                const userId =
                    user.email.split("@")[0];

                if (userId === ADMIN_ID) {

                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.type =
                        "button";

                    deleteButton.className =
                        "more-button";

                    deleteButton.title =
                        "게시글 삭제";

                    deleteButton.textContent =
                        "✕";


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
                                renderRanking();


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


                    postRow.appendChild(
                        deleteButton
                    );

                } else {

                    // 더보기 칸 높이 유지를 위한 빈 자리
                    postRow.appendChild(
                        document.createElement("span")
                    );

                }

            } else {

                postRow.appendChild(
                    document.createElement("span")
                );

            }


            postList.appendChild(
                postRow
            );

        }
    );


    // 게시글이 하나도 없을 때 안내 문구
    if (visibleCount === 0) {

        const emptyState =
            document.createElement("div");

        emptyState.className =
            "empty-state";

        emptyState.textContent =
            allPosts.length === 0
                ? "아직 등록된 게시글이 없습니다."
                : "검색 결과가 없습니다.";

        postList.appendChild(emptyState);

    }

}


// 오른쪽 사이드바 인기 게시글 카드
function renderRanking() {

    if (!rankingList) {

        return;

    }

    rankingList.innerHTML = "";


    const topPosts =
        [...allPosts]
            .sort(function(a, b) {

                const likesA =
                    a.likes || 0;

                const likesB =
                    b.likes || 0;

                return likesB - likesA;

            })
            .slice(0, 5);


    if (topPosts.length === 0) {

        const emptyRanking =
            document.createElement("p");

        emptyRanking.className =
            "ranking-empty";

        emptyRanking.textContent =
            "아직 인기 게시글이 없습니다.";

        rankingList.appendChild(emptyRanking);

    } else {

        topPosts.forEach(
            function(post, index) {

                const rankButton =
                    document.createElement("button");

                rankButton.type =
                    "button";

                rankButton.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            "post.html?id=" +
                            post.id;

                    }
                );


                const rankNumber =
                    document.createElement("b");

                rankNumber.textContent =
                    String(index + 1).padStart(2, "0");


                const rankTitle =
                    document.createElement("span");

                rankTitle.textContent =
                    post.title;


                rankButton.appendChild(rankNumber);
                rankButton.appendChild(rankTitle);

                rankingList.appendChild(rankButton);

            }
        );

    }


    if (rankingUpdated) {

        const now = new Date();

        const hours =
            String(now.getHours()).padStart(2, "0");

        const minutes =
            String(now.getMinutes()).padStart(2, "0");

        rankingUpdated.textContent =
            hours + ":" + minutes + " 기준";

    }

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

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            renderPosts();

        }

    }
);


// 게시글 불러오기
loadPosts();
