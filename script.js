import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    getCountFromServer
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

const navTabButtons =
    document.querySelectorAll(
        ".main-navigation [data-sort]"
    );

const rankingList =
    document.getElementById("ranking-list");

const rankingUpdated =
    document.getElementById("ranking-updated");


// 현재 게시글 목록
let allPosts = [];

// 현재 정렬 방식 ("latest" | "popular")
let currentSortType = "latest";


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


        // 게시글마다 댓글 수를 따로 집계해서 붙여줌
        await Promise.all(
            allPosts.map(
                async function(post) {

                    try {

                        const commentsRef =
                            collection(
                                db,
                                "posts",
                                post.id,
                                "comments"
                            );

                        const countSnapshot =
                            await getCountFromServer(
                                commentsRef
                            );

                        post.commentCount =
                            countSnapshot.data().count;

                    } catch (error) {

                        post.commentCount = 0;

                    }

                }
            )
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


// 숫자를 1k, 1m 같은 축약형으로 표시
function formatCount(number) {

    const count =
        number || 0;

    if (count >= 1000000) {

        const value =
            (count / 1000000)
                .toFixed(1)
                .replace(/\.0$/, "");

        return value + "m";

    }

    if (count >= 1000) {

        const value =
            (count / 1000)
                .toFixed(1)
                .replace(/\.0$/, "");

        return value + "k";

    }

    return String(count);

}


// 작성 시각을 'n분 전' 같은 상대 시간으로 표시
function timeAgo(timestamp) {

    if (!timestamp) {

        return "";

    }

    const date =
        timestamp.toDate();

    const diffSeconds =
        Math.floor(
            (Date.now() - date.getTime()) / 1000
        );

    if (diffSeconds < 60) {

        return "방금 전";

    }

    const diffMinutes =
        Math.floor(diffSeconds / 60);

    if (diffMinutes < 60) {

        return diffMinutes + "분 전";

    }

    const diffHours =
        Math.floor(diffMinutes / 60);

    if (diffHours < 24) {

        return diffHours + "시간 전";

    }

    const diffDays =
        Math.floor(diffHours / 24);

    return diffDays + "일 전";

}


// 게시글 표시
function renderPosts() {

    const postList =
        document.getElementById(
            "post-list"
        );

    postList.innerHTML = "";


    // 원본 배열을 건드리지 않도록 복사
    const sortedPosts =
        [...allPosts];


    // 최신순
    if (currentSortType === "latest") {

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
    else if (currentSortType === "popular") {

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


            // 작성자 닉네임 + 상대 시간 (ex. 운영자 · 2분 전)
            const authorLine =
                document.createElement("p");

            authorLine.className =
                "post-author";

            authorLine.textContent =
                (post.authorNickname || "익명") +
                " · " +
                timeAgo(post.createdAt);


            postCopy.appendChild(titleElement);


            // 댓글 수 · 조회수 · 좋아요 수 (아이콘 포함)
            const postStats =
                document.createElement("div");

            postStats.className =
                "post-stats";


            const commentStat =
                document.createElement("span");

            commentStat.title =
                "댓글";

            commentStat.innerHTML =
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

            commentStat.append(
                formatCount(post.commentCount)
            );


            const viewStat =
                document.createElement("span");

            viewStat.title =
                "조회수";

            viewStat.innerHTML =
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';

            viewStat.append(
                formatCount(post.views)
            );


            const likeStat =
                document.createElement("span");

            likeStat.title =
                "좋아요";

            likeStat.innerHTML =
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

            likeStat.append(
                formatCount(post.likes)
            );


            postStats.appendChild(commentStat);
            postStats.appendChild(viewStat);
            postStats.appendChild(likeStat);


            // 작성자/시간과 댓글·조회·좋아요를 같은 줄에 배치
            const postSubline =
                document.createElement("div");

            postSubline.className =
                "post-subline";

            postSubline.appendChild(authorLine);
            postSubline.appendChild(postStats);


            postCopy.appendChild(postSubline);


            postRow.appendChild(postCopy);



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

                }

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


// 상단 탭 (전체글 / 최신글 / 인기글)
navTabButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                navTabButtons.forEach(
                    function(otherButton) {

                        otherButton.classList.remove(
                            "selected"
                        );

                    }
                );

                button.classList.add(
                    "selected"
                );

                currentSortType =
                    button.dataset.sort;

                renderPosts();

            }
        );

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
