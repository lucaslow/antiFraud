/******************* loading 配置 ***********************/
var queue = new createjs.LoadQueue(true);
var queueTimer = null

const loadingText_len = $('.loading_main p').length
var cur_len = 3
setTimeout(function () {
    $('.loading_main p:nth-of-type(2)').addClass('on').siblings('p').removeClass('on')
}, 1000)
queueTimer = setInterval(function () {
    if (cur_len > loadingText_len) {
        cur_len = 0
    }
    let cur = '.loading_main p:nth-of-type(' + cur_len + ')'
    $(cur).addClass('on').siblings('p').removeClass('on')
    cur_len += 1
}, 1000)

queue.loadManifest([
    './assets/begin_tips.png',
    './assets/bg.jpg',
    './assets/award_box.png',
    './assets/loading.png',
    './assets/slogan.png',
    './assets/loading_icon.png',
    './assets/rule_bg.png',
    './assets/slogan_cover.png',
    './assets/slogan_cover.png',
])
// queue.on('progress', handleFileLoad, this);
queue.on('complete', handleFileComplete, this);

function handleFileComplete() {
    setTimeout(function () {
        $('.loadingPage').hide()
        // app.goPagedo(1)
        clearInterval(queueTimer)
    }, 1500)
}

var app = new Vue({
    el: '#app',
    data: {
        version: 'teacher', // 'student' 'teacher' 当前版本
        isAxios: false, // 当前是否在请求
        isAnswer: false, // 当前是否已经答题了（决定是否可以抽奖）
        user_name: '',
        town_school_config: town_school, // 镇区和学校的关系JSON配置
        user_town: -1, // 用户选择的镇区
        user_school: -1, // 用户选择的学校
        serConfig: ['A', 'B', 'C', 'D', 'E'],
        cur_ques_index: 0, // 当前题目序号（默认是0）
        user_active_opt: [], // 当前用户选择的答案 (切换题目时需要将此参数归置 [])
        user_result: [], // 用户回答情况
        supplyText: '', // 用户补充说明的内容
        ratio: Number,
        cur_detail_id: Number, // 当前显示的奖品详情 的id
        user_score: 0, // 用户答题得分
        // user_score: 0, // 用户答题正确数量
        // ********* 抽奖的配置 ***************** //
        activeIndex: -1, // 当前中奖状态的位置
        count: 8, //抽奖总共有多少个位置
        timer: 0, // 抽奖每次转动定时器
        speed: 200, // 初始转动速度
        times: 0, // 当前要转动的次数
        cycle: 50, // 基础要转动的次数
        prize: 1, // 抽中的奖品序号
        isLotterying: false, // 当前是否在抽奖
        prize_cdk: '', // cdk兑换券
        // showToast: false,
        // **** 用户留资数据 *****//
        user_info: {
            name: '',
            tel: '',
            address: ''
        },
        // ********* 用户所有信息 ***************** //
        openid: '',
        draw_log: [
            // {
            //     cash_time: "2020-09-30 02:13:10",
            //     prize_cdk: "",
            //     prize_id: 1,
            //     prize_name: "滴滴打车券"
            // }
        ], // 用户获得的奖品列表
        has_draw: 0, //用户是否已经抽过奖 0: 未抽奖；1：已抽奖
    },
    created: function () {
        const _t =this
        $("input,select").blur(function () {
            setTimeout(function () {
                var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            }, 300);
        })
        $("input,select").change(function () {
            setTimeout(function () {
                var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            }, 300);
        })
        // 判断是否openid
        if (!this.getCookie('openid')) {
            // 无openid操作
            // return
            window.location.href = window.location.href + '?debug=relogin'
        }
        this.openid = this.getCookie('openid')

        // 查询用户信息
        // $.ajax({
        //     url: 'http://h5.intech.szhhhd.com/out/A20200926_answer/get_user_info?openid=' + _t.openid,
        //     type: 'get',
        //     // 设置的是请求参数
        //     dataType: 'jsonp',
        //     success: function (res) {
        //         console.log(res)
        //     },
        //     error: function (err) {
        //         console.log(err)
        //     }
        // })

        getUserInfo({
            openid: this.openid
        }).then(function(res) {
            if(res.data.code == 0) {
                console.log(res.data.data)
                const userData = res.data.data
                _t.user_name = userData.username
                _t.user_school = userData.school
                _t.user_town = userData.address_town
                _t.has_draw = userData.has_draw
                _t.draw_log = userData.draw_log
            }
        })
    },
    mounted: function () {
        this.initProgame()
        this.resizeFun()
    },
    computed: {
        // 获取当前显示学校下拉框列表
        curSchoolConfig: function () {
            const _t = this
            let arr = []
            if (_t.user_town != -1) {
                _t.town_school_config.find(function (item) {
                    if (item.town == _t.user_town) {
                        arr = arr.concat(item.school)
                    }
                })
            } else {
                _t.town_school_config.forEach(function (item) {
                    arr = arr.concat(item.school)
                })
            }
            return arr
        },
        // 当前版本对应的问题配置
        questions_config: function () {
            return this.version === 'student' ? student_questions : teacher_questions
        },
        // 当前版本对应的奖品配置
        gift_config: function () {
            return this.version === 'student' ? student_gift : teacher_gift
        }
    },
    methods: {
        initProgame: function () {
            //默认执行
            var _t = this
            /** * 禁止body默认滑动事件 */
            // document.body.style.overflow = 'hidden';
            // function _preventDefault(e) {
            //     e.preventDefault()
            // }
            // document.addEventListener('touchmove', _preventDefault, {
            //     passive: false
            // });
            $(window).resize(function (event) {
                setTimeout(function () {
                    _t.resizeFun()
                }, 200)
            })
            if (_t.checkAndroid()) {
                $('.question_part').addClass('ad')
            }
            // alert(_t.checkAndroid())
            // 点击遮罩关闭弹窗
            // $('.dialog_wrap').on('click', function(event) {
            //     _t.closeDialog()
            // })
            // $('.dialog').click(function(event) {
            //     event.stopPropagation()
            // })
        },
        checkAndroid: function(){
            var bool = false;
            var userAgent = navigator.userAgent;
            if (userAgent.toLowerCase().indexOf('android') > -1) bool = true;
            return bool;
        },
        resizeFun: function () {
            //适配短屏与长屏
            var _t = this
            $('body').height($(window).height())
            $('body').removeClass('hightscreen shortscreen portrait')
            _t.ratio = $(window).width() / $(window).height()
            if (screenState == 'portrait') {
                $('body').addClass('portrait');
                if (_t.ratio > .6) {
                    $('body').addClass('shortscreen')
                    if (_t.ratio > .64) {
                        $('body').addClass('xshortscreen')
                    }
                } else if (_t.ratio < .54) {
                    $('body').addClass('hightscreen')
                    if (_t.ratio < .5) {
                        $('body').addClass('xhightscreen')
                    }
                }
            }
        },
        goPagedo: function (toIndex) {
            var _t = this
            $('.page_' + toIndex).addClass('active').siblings('.page').removeClass('active')
            $('.page_' + toIndex).removeClass('blur')
            setTimeout(function () {
                $('.page_' + toIndex).removeClass('blur').siblings('.page').addClass('blur')
            }, 300)
        },
        initUserSchool: function () {
            this.user_school = -1
        },
        numToLetter: function (num) {
            let myNum;
            if (num.length >= 2) {
                myNum = []
                num.forEach((item, index) => {
                    myNum[index] = this.serConfig[item]
                })
            } else {
                myNum = this.serConfig[num[0]]
            }
            return myNum
        },
        getCookie: function (t) {
            return document.cookie.length > 0 && (c_start = document.cookie.indexOf(t + "="), -1 != c_start) ? (c_start = c_start + t.length + 1, c_end = document.cookie.indexOf(";", c_start), -1 == c_end && (c_end = document.cookie.length), decodeURI(document.cookie.substring(c_start, c_end))) : ""
        },
        initInput: function () {
            // 修复某些ios机型输入框失去焦点之后无法恢复
            const _t = this
            setTimeout(function () {
                let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
                window.scrollTo(0, Math.max(scrollHeight - 1, 0));
            }, 300)
        },
        beginQuestion: function () {
            // 开始答题
            const _t = this
            if (_t.user_name === '' || _t.user_town == -1 || _t.user_school == -1) {
                // 判断信息是否填写完整
                _t.goPagedo(1)
                alert('请先填写完整信息')
                return false
            }
            if(_t.isAxios) {
                return false
            }
            _t.isAxios = true
            const params = {
                openid: _t.openid,
                identity_type: _t.version,
                school: _t.user_school,
                address_town: _t.user_town,
                username: _t.user_name
            }
            // $.ajax({
            //     url: 'http://h5.intech.szhhhd.com/out/A20200926_answer/set_user_info',
            //     type: 'get',
            //     data: params,
            //     // 设置的是请求参数
            //     dataType: 'jsonp',
            //     success: function (res) {
            //         console.log(res)
            //         if (res.code == 200 || res.code == 10003) {
            //             _t.goPagedo(2)
            //         }
            //     },
            //     error: function (err) {
            //         console.log(err)
            //     }
            // })
            submitUserInfo(params).then(function(res) {
                if (res.data.code == 200 || res.data.code == 10003) {
                    _t.goPagedo(2)
                }
                _t.isAxios = false
            }).catch(function(err) {
                alert('网络出错，请刷新')
                _t.isAxios = false
                console.log(err)
            })
        },
        toMyAwards: function () {
            // 我的奖品按钮 点击方法
            // 通过 has_draw 判断用户是否已经抽奖 ，决定跳转的页面
            if (this.has_draw) {
                // 已经抽奖则跳转到奖品列表
                this.goPagedo(5)
            } else {
                this.goPagedo(4)
            }
        },
        openDialog: function (diaId) {
            $('.dialog_wrap').addClass('show');
            $('#' + diaId).addClass('show').siblings('.dialog').removeClass('show');
        },
        closeDialog: function () {
            $('.dialog_wrap').removeClass('show');
            $('.dialog').removeClass('show');
        },
        userChoice: function (index, isMult = false, isNeed = true) {
            // 用户点击选项 的方法
            // 传入参数 用户选择的选项序号 + 是否多选 + 是否需要答案（客观题）
            const _t = this
            if (_t.user_active_opt.length !== 0 && !isMult && isNeed) return false // 如果已经选择选项 + 该题不是客观题（无答案） + 不是多选 = 则无法再选择其他选项
            if (!isMult) {
                // 单选
                _t.user_active_opt = []
                _t.user_active_opt.push(index)
            } else {
                // 多选
                if (_t.user_active_opt.indexOf(index) !== -1) {
                    // 如果已经选中了再选择，则剔除
                    _t.user_active_opt.splice(_t.user_active_opt.indexOf(index), 1)
                } else {
                    _t.user_active_opt.push(index)
                }
            }
        },
        nextQues: function () {
            // 点击下一道题按钮的方法
            const _t = this
            _t.user_result[_t.cur_ques_index] = _t.numToLetter(_t.user_active_opt) // 记录用户答题情况
            // 判断得分
            const cur_ques = this.questions_config[this.cur_ques_index]
            if (cur_ques.isNeed) {
                if (this.user_active_opt.includes(cur_ques.correctOpt)) {
                    _t.user_score += 1
                }
            }

            if (_t.cur_ques_index >= _t.questions_config.length - 1) {
                // 答题结束
                // 处理用户答题数据返回后台
                _t.user_answer_callback()
            } else {
                // 切换题目需要将题目序号增加1  和 将当前选择的选项归置为 -1
                _t.cur_ques_index += 1
                _t.user_active_opt = []
            }
        },
        startLottery() {
            // 点击开始抽奖按钮
            const _t = this
            if(!_t.isAnswer) {
                // 如果已经抽过奖则需要重新答题才能继续抽奖
                alert('当前答题已经抽奖了，请重新答题！')
                return false
            }
            if (this.isLotterying) {
                return false
            } else {
                this.isLotterying = true;
                getLottery({
                    openid: _t.openid
                }).then(function(res) {
                    console.log(res)
                    if(res.data.code == 0) {
                        _t.prize_cdk = res.data.data.prize_cdk
                        _t.prize = res.data.data.prize_id
                        const prize_name = res.data.data.prize_name
                        _t.startRoll();
                    }else {
                        alert(res.data.msg)
                    }
                }).catch(function(err) {
                    console.log(err)
                    alert('网络错误，请重新尝试')
                })
            }
        },
        startRoll() {
            const _t = this
            this.times += 1
            this.oneRoll()
            if (this.times > this.cycle + 10 && this.prize === this.activeIndex) {
                clearTimeout(this.timer)
                _t.cur_detail_id = _t.prize // 设置当前显示的奖品详情id
                _t.isAnswer = false // 设置当前已经抽完奖了，需要重新答题
                setTimeout(function () {
                    // 跳到详情页
                    _t.goPagedo(6)
                }, 500)
                this.prize = -1
                this.times = 0
                this.speed = 200
                this.isLotterying = false
            } else {
                if (this.times < this.cycle) {
                    this.speed -= 10
                } else if (this.times > this.cycle + 10 && ((this.prize === 0 && this.activeIndex === 7) || this.prize === this.index + 1)) {
                    this.speed += 110
                } else {
                    this.speed += 20
                }
                if (this.speed < 40) {
                    this.speed = 40
                }
                this.timer = setTimeout(this.startRoll, this.speed)
            }
        },
        oneRoll() {
            let index = this.activeIndex
            const count = this.count
            index += 1
            if (index > count - 1) {
                index = 0
            }
            this.activeIndex = index
        },
        getGiftDetail: function (id, cdk) {
            // 跳转到奖品详情页面
            // cur_detail_id 决定显示哪个奖品的详情
            this.cur_detail_id = id
            this.prize_cdk = cdk
            this.goPagedo(6)
        },
        applyInfo: function () {
            // 提交用户的留资
            const _t = this
            if (this.user_info.name.trim() == '' || this.user_info.tel.trim() == '' || this.user_info.address.trim() == '') {
                alert('请填写完整信息')
                return false
            }
            // 提交后台数据
            postUserInfo({
                openid: _t.openid,
                send_name: _t.user_info.name,
                send_phone: _t.user_info.tel,
                send_address: _t.user_info.address
            }).then(function(res) {
                if(res.data.code == 200) {
                    _t.goPagedo(8)
                } else{
                    alert(res.data.msg)
                }
            }).catch(function(err) {
                console.log(err)
                alert('网络出错，请重新刷新！')
            })
            
        },
        user_answer_callback: function () {
            // 处理用户的答案 返回后台记录
            const _t = this
            const post = []
            this.user_result.forEach(function (item, index) {
                post[index] = {
                    answer_id: index + 1,
                    content: ''
                }
                if (item instanceof Array) {
                    post[index].answer = item.join('')
                } else {
                    post[index].answer = item
                }
                if (index === 3 && _t.version === 'student' && item.includes('D')) {
                    // 如果是学生 且 是第四道题时就将补充内容 supplyText 赋值给 content
                    post[index].content = _t.supplyText
                }
                if (index === 5 && _t.version === 'teacher' && item.includes('D')) {
                    // 如果是教师 且 是第六道题时就将补充内容 supplyText 赋值给 content
                    post[index].content = _t.supplyText
                }
            })

            // 将答题情况返回后台
            // $.ajax({
            //     url: 'http://h5.intech.szhhhd.com/out/A20200926_answer/set_answer',
            //     type: 'POST',
            //     data: {
            //         openid: _t.openid,
            //         post
            //     },
            //     // 设置的是请求参数
            //     dataType: 'jsonp',
            //     success: function (res) {
            //         console.log(res)
            //     },
            //     error: function (err) {
            //         console.log(err)
            //     }
            // })
            if(_t.isAxios) {
                return false
            }
            _t.isAxios = true
            uploadUserAnswer({
                post
            }, _t.openid, _t.user_score).then(function (res) {
                if(res.data.code == 10007 || res.data.code == 0) {
                    _t.goPagedo(3)
                    _t.isAnswer = true // 设置当前已经答完题了可以抽奖
                }
                _t.isAxios = false
                console.log(res)
            }).catch(function (err) {
                console.log(err)
                _t.isAxios = false
            })
        }
    }
})


// 分享
var _wxData

if(app.version === 'student') {
    _wxData = {
        shareTitle : "嘿，同学！你有一份反诈骗试题待作答",
        shareDesc : "诈骗套路知多少？中山联通反诈知识宣传，答题人人有奖！",
        shareImgUrl : "http://wx.szhhhd.com/public/h5/a20200924answer_t/assets/share.jpg"
    };
} else {
    _wxData = {
        shareTitle : "防范网络诈骗，宣传走进校园",
        shareDesc : "诈骗套路知多少？中山联通反诈知识宣传，答题人人有奖！",
        shareImgUrl : "http://wx.szhhhd.com/public/h5/a20200924answer_t/assets/share.jpg"
    };
}
