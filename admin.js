// 관리자 ID
const ADMIN_ID = "adbabdaqpapq";


// 현재 사용자가 관리자인지 확인
function isAdmin(user) {

    if (!user) {
        return false;
    }


    if (!user.email) {
        return false;
    }


    const userId =
        user.email.split("@")[0];


    return userId === ADMIN_ID;
}


export {
    ADMIN_ID,
    isAdmin
};
