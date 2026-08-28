import { db, auth } from "../firebase.js";

import { isAdmin } from "./admin.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



const urlParams =
    new URLSearchParams(
        window.location.search
    );


const postId =
    urlParams.get("id");


const postDetail =
    document.getElementById(
        "post-detail"
    );



if(!postDetail || !postId){

    console.error(
        "댓글 영역을 찾을 수 없습니다."
    );

}



// 댓글 영역

const commentArea =
    document.createElement(
        "div"
    );


commentArea.className =
    "comment-area";



const commentInput =
    document.createElement(
        "input"
    );


commentInput.placeholder =
    "댓글을 입력하세요.";



const commentButton =
    document.createElement(
        "button"
    );


commentButton.textContent =
    "댓글 등록";



const commentTitle =
    document.createElement(
        "h3"
    );


commentTitle.textContent =
    "댓글";



const commentList =
    document.createElement(
        "div"
    );


commentList.id =
    "comment-list";



commentArea.appendChild(
    commentInput
);


commentArea.appendChild(
    commentButton
);



postDetail.appendChild(
    commentArea
);


postDetail.appendChild(
    commentTitle
);


postDetail.appendChild(
    commentList
);





// 댓글 불러오기

async function loadComments(){


    commentList.innerHTML =
        "";



    try{


        const commentsRef =
            collection(
                db,
                "posts",
                postId,
                "comments"
            );



        const commentsQuery =
            query(
                commentsRef,
                orderBy(
                    "createdAt",
                    "asc"
                )
            );



        const snapshot =
            await getDocs(
                commentsQuery
            );



        snapshot.forEach(
            function(commentDoc){


                const comment =
                    commentDoc.data();



                const commentElement =
                    document.createElement(
                        "div"
                    );



                const commentText =
                    document.createElement(
                        "span"
                    );



                // 기존 댓글 + 새 댓글 모두 대응

                if(comment.authorNickname){

                    commentText.textContent =
                        comment.authorNickname
                        + ": "
                        + comment.content;

                }else{


                    commentText.textContent =
                        comment.content;

                }




                commentElement.appendChild(
                    commentText
                );




                // 관리자 삭제

                if(
                    isAdmin(
                        auth.currentUser
                    )
                ){


                    const deleteButton =
                        document.createElement(
                            "button"
                        );


                    deleteButton.textContent =
                        "삭제";



                    deleteButton.onclick =
                        async function(){


                            const result =
                                confirm(
                                    "댓글을 삭제할까요?"
                                );


                            if(!result){

                                return;

                            }



                            await deleteDoc(
                                commentDoc.ref
                            );


                            loadComments();

                        };



                    commentElement.appendChild(
                        deleteButton
                    );

                }



                commentList.appendChild(
                    commentElement
                );


            }
        );


    }catch(error){


        console.error(
            "댓글 불러오기 오류:",
            error
        );


    }

}





// 댓글 등록

commentButton.addEventListener(
    "click",
    async function(){


        const text =
            commentInput.value.trim();



        if(text === ""){


            alert(
                "댓글을 입력해주세요."
            );


            return;

        }




        const user =
            auth.currentUser;



        if(!user){


            alert(
                "로그인 후 댓글을 작성할 수 있습니다."
            );


            return;

        }





        try{


            // 로그인 ID가 아닌 실제 닉네임을 가져옴
            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if(!userSnapshot.exists()){


                alert(
                    "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
                );


                return;

            }


            const userData =
                userSnapshot.data();


            const nickname =
                userData.nickname;


            if(!nickname){


                alert(
                    "닉네임 정보를 찾을 수 없습니다."
                );


                return;

            }



            await addDoc(
                collection(
                    db,
                    "posts",
                    postId,
                    "comments"
                ),
                {

                    content:
                        text,


                    authorNickname:
                        nickname,


                    createdAt:
                        serverTimestamp()

                }
            );



            commentInput.value =
                "";



            loadComments();



        }catch(error){


            console.error(
                "댓글 저장 오류:",
                error
            );


        }


    }
);




loadComments();
