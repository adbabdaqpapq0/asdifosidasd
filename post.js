import { db, auth } from "../firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { setupLike } from "./like.js";


const postDetail =
    document.getElementById(
        "post-detail"
    );

// 게시글 본문 전용 영역
// (댓글/좋아요 영역은 여기에 포함되지 않음 -> 서로 지워지지 않음)
const postContent =
    document.getElementById(
        "post-content"
    );


const urlParams =
    new URLSearchParams(
        window.location.search
    );


const postId =
    urlParams.get("id");


// 조회수 쿨타임 (1시간)
const VIEW_COOLDOWN_MS =
    60 * 60 * 1000;


// 이 브라우저에서 이 게시글의 조회수를
// 지금 올려도 되는지 확인
function canIncrementView(postId, isLoggedIn){

    const cooldownKey =
        "yar_view_" + postId;


    const lastTime =
        Number(
            localStorage.getItem(cooldownKey)
            || 0
        );


    const now =
        Date.now();


    // 쿨타임(1시간) 안 지났으면 증가 불가
    if(now - lastTime < VIEW_COOLDOWN_MS){

        return false;

    }


    // 비로그인 사용자는 게시글당 평생 1회만 증가 가능
    if(!isLoggedIn){

        const anonKey =
            "yar_view_anon_" + postId;


        if(
            localStorage.getItem(anonKey)
            === "true"
        ){

            return false;

        }

    }


    return true;

}


// 조회수를 올렸다는 사실을 기록
function markViewIncremented(postId, isLoggedIn){

    localStorage.setItem(
        "yar_view_" + postId,
        String(Date.now())
    );


    if(!isLoggedIn){

        localStorage.setItem(
            "yar_view_anon_" + postId,
            "true"
        );

    }

}



async function loadPost(user){


    const isLoggedIn =
        !!user;


    if(!postId){

        postDetail.innerHTML =
            "<p>게시글을 찾을 수 없습니다.</p>";

        return;

    }



    try{


        const postRef =
            doc(
                db,
                "posts",
                postId
            );



        const snapshot =
            await getDoc(
                postRef
            );



        if(!snapshot.exists()){


            postDetail.innerHTML =
                "<p>게시글을 찾을 수 없습니다.</p>";

            return;

        }



        const post =
            snapshot.data();




        // 조회수 증가
        // (쿨타임 1시간, 비로그인은 게시글당 최대 1회)

        let views =
            post.views || 0;



        if(
            canIncrementView(
                postId,
                isLoggedIn
            )
        ){


            await updateDoc(
                postRef,
                {
                    views:
                        increment(1)
                }
            );


            views++;


            markViewIncremented(
                postId,
                isLoggedIn
            );


        }





        // 제목

        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            post.title;





        // 작성자

        const author =
            document.createElement(
                "p"
            );


        author.textContent =
            "작성자: "
            + post.authorNickname;





        // 날짜

        const date =
            document.createElement(
                "p"
            );


        if(post.createdAt){


            const d =
                post.createdAt.toDate();



            date.textContent =
                d.getFullYear()
                + "/"
                + String(
                    d.getMonth()+1
                ).padStart(2,"0")
                + "/"
                + String(
                    d.getDate()
                ).padStart(2,"0")
                + " "
                + String(
                    d.getHours()
                ).padStart(2,"0")
                + ":"
                + String(
                    d.getMinutes()
                ).padStart(2,"0");



        }else{


            date.textContent =
                "날짜 없음";

        }





        // 조회수

        const view =
            document.createElement(
                "p"
            );


        view.textContent =
            "조회수: "
            + views;





        // 내용

        const content =
            document.createElement(
                "p"
            );


        content.textContent =
            post.content;





        // 초기화
        // post-content 영역만 비움 (댓글/좋아요 영역은 그대로 유지됨)

        postContent.innerHTML =
            "";





        postContent.appendChild(
            title
        );


        postContent.appendChild(
            author
        );


        postContent.appendChild(
            date
        );


        postContent.appendChild(
            view
        );


        postContent.appendChild(
            content
        );





        // 좋아요 영역

        const likeArea =
            document.createElement(
                "div"
            );


        likeArea.className =
            "like-area";


        postContent.appendChild(
            likeArea
        );



        setupLike(
            postId,
            post
        );



    }catch(error){


        console.error(
            "게시글 불러오기 오류:",
            error
        );


        postDetail.innerHTML =
            "<p>게시글을 불러오지 못했습니다.</p>";

    }

}



// 로그인 상태가 확정된 후 한 번만 게시글을 불러옴
// (비로그인/로그인 여부에 따라 조회수 규칙이 다르므로
//  auth 상태 확인 전에 실행되면 안 됨)

let started = false;


onAuthStateChanged(
    auth,
    function(user){

        if(started){

            return;

        }


        started = true;


        loadPost(user);

    }
);
