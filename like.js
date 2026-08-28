import { db, auth } from "../firebase.js";


import {
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";





export function setupLike(
    postId,
    postData
){



    const likeArea =
        document.querySelector(
            ".like-area"
        );



    if(!likeArea){

        return;

    }




    const likeButton =
        document.createElement(
            "button"
        );


    likeButton.textContent =
        "좋아요";



    const likeCount =
        document.createElement(
            "span"
        );


    let count =
        postData.likes || 0;



    likeCount.textContent =
        " " + count;



    likeArea.appendChild(
        likeButton
    );


    likeArea.appendChild(
        likeCount
    );





    const storageKey =
        "yar_like_" + postId;



    let liked =
        localStorage.getItem(
            storageKey
        )
        === "true";





    function updateDisplay(){


        if(liked){


            likeButton.textContent =
                "좋아요 취소";


        }else{


            likeButton.textContent =
                "좋아요";


        }

    }





    updateDisplay();





    likeButton.addEventListener(
        "click",
        async function(){


            // 로그인 확인
            const user =
                auth.currentUser;


            if(!user){


                alert(
                    "로그인 후 좋아요를 누를 수 있습니다."
                );


                return;

            }




            const postRef =
                doc(
                    db,
                    "posts",
                    postId
                );



            try{


                if(!liked){


                    await updateDoc(
                        postRef,
                        {

                            likes:
                                increment(1)

                        }
                    );


                    count++;


                    liked =
                        true;


                    localStorage.setItem(
                        storageKey,
                        "true"
                    );



                }else{


                    await updateDoc(
                        postRef,
                        {

                            likes:
                                increment(-1)

                        }
                    );



                    count--;


                    liked =
                        false;



                    localStorage.removeItem(
                        storageKey
                    );


                }



                likeCount.textContent =
                    " " + count;



                updateDisplay();



            }catch(error){


                console.error(
                    "좋아요 오류:",
                    error
                );


            }


        }
    );

}
