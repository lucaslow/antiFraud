/******************* axios请求 配置 ***********************/
var base_url = 'http://h5.intech.szhhhd.com/out/A20200926_answer'; //请求服务器
// var base_url2 = 'http://mdata-api.idealead-prod.cluster.gdinsight.com'; //请求服务器

// 实例化axios 与 ajax用法相似
const service = axios.create({
    baseURL: base_url, // api的base_url
    timeout: 5000 // 请求超时时间
})

// 接口列表

// 查询用户信息接口
function getUserInfo(params) {
    return service({
        url: '/get_user_info',
        method: 'get',
        params: params
    })
}

// 录入用户信息接口（用户答题之前，填写完了个人信息需要请求过来录入数据库）
function submitUserInfo(params) {
    return service({
        url: '/set_user_info',
        method: 'get',
        params: params
    })
}

// 查询用户信息接口
function getUserInfo(params) {
    return service({
        url: '/get_user_info',
        method: 'get',
        params
    })
}

// 上传用户答题情况
// post: [
//     {
//         answer_id: 1,
//         answer: 'A',
//         content: ''
//     }
// ]
function uploadUserAnswer(data, openid, as) {
    return service({
        url: '/set_answer?openid=' + openid + '&as=' + as,
        method: 'post',
        data
    })
}

// 抽奖
function getLottery(params) {
    return service({
        url: '/draw',
        method: 'get',
        params
    })
}

// 保存留资信息接口
function postUserInfo(params) {
    return service({
        url: '/leave_info',
        method: 'get',
        params
    })
}