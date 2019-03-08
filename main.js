
let APP_ID = 's31J1OQP9GG3Wx3JIhT4pUCB-gzGzoHsz'
let APP_KEY = 'FvNACBhf4Jq53f57y4CFbYnF'
AV.init({
    appId: APP_ID,
    appKey: APP_KEY
})
var messageList = []
var query = new AV.Query('message')

let $messageList = $('#messageList')
function getDateDiff(dateTimeStamp) {
    let minute = 1000 * 60
    let hour = minute * 60
    let day = hour * 24
    let month = day * 30
    let now = new Date().getTime()
    let diffValue = now - dateTimeStamp
    if (diffValue < -20000) { return; }
    let monthC = diffValue / month
    let weekC = diffValue / (7 * day)
    let dayC = diffValue / day
    let hourC = diffValue / hour
    let minC = diffValue / minute
    let result
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前"
    }
    else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前"
    }
    else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前"
    }
    else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前"
    }
    else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前"
    } else
        result = "刚刚"
    return result
}
query.descending("createdAt").find().then((message) => {
    message.forEach((value, index) => {
        let messageData = JSON.parse(value.attributes.data)
        let hideName = value.attributes.hideName
        let id = value.id
        let ownerId = messageData.objectId
        let userName = messageData.nickName
        if (hideName) userName += ' (匿名)'
        let content = messageData.value
        let files = messageData.files
        let time = getDateDiff(new Date(value.createdAt).getTime())
        let picLength = files.length
        messageList.push({ time, userName, content, id, files, picLength, ownerId })
        let $li = $('<li class="message"></li>')
        $messageList.append($li)
        let $spanUser = $(`<span class="userName">${userName}</span>`)
        let $spanContent = $(`<span class="content">${content}</span>`)
        let $spanTime = $(`<span class="time">${time}</span>`)
        let $spanPicLength = $(`<span class="picLength    ">${picLength}</span>`)
        let $messageBox = $('<div class="messageBox"></div>')
        let $buttonBox
        if (value.attributes.show) {
            $buttonBox = $('<div class="buttonBox"><button class="deleted">删除</button><button class="addToTree disabled">撤下留言</button></div>')
        } else {
            $buttonBox = $('<div class="buttonBox"><button class="deleted">删除</button><button class="addToTree">添加到树洞</button></div>')

        }
        $messageBox.append($spanTime, $spanUser, $spanContent, $spanPicLength)
        $li.append($messageBox, $buttonBox)
        $buttonBox.on('click', '.deleted', (e) => {
            let $deletedButton = $(e.currentTarget)
            let $parentList = $deletedButton.parents('.message')
            let index = $parentList.index()
            console.log('删除', messageList[index])
            let deletedId = messageList[index].id
            var todo = AV.Object.createWithoutData('message', deletedId)
            todo.destroy().then((success) => {
                // 删除成功
                let array = messageList[index].files.map((value) => {
                    let picID = value.picID
                    var file = AV.File.createWithoutData(picID);
                    return file.destroy()
                })
                Promise.all(array).then((success) => {
                    console.log('删除成功！')
                    $parentList.remove()
                    messageList.splice(index, 1)
                })
            }, function (error) {
                // 删除失败
                alert('删除失败，请重试！')
            })
        })
        $($buttonBox.children()[1]).on('click', (e) => {
            // 第一个参数是 className，第二个参数是 objectId
            if (value.attributes.show) {
                var todo = AV.Object.createWithoutData('message', id);
                // 修改属性
                todo.set('show', false);
                // 保存到云端
                todo.save().then(() => {
                    $($buttonBox.children()[1]).text('添加到树洞').removeClass('disabled')
                })
            } else {
                var todo = AV.Object.createWithoutData('message', id);
                // 修改属性
                todo.set('show', true);
                // 保存到云端
                todo.save().then(() => {
                    $($buttonBox.children()[1]).text('撤下留言').addClass('disabled')
                })
            }
            value.attributes.show = !value.attributes.show
        })
    })
})
let value
let timeId
$('#POST-password').on('change',(e)=>{
    value=e.target.value
})
$('#submitButton').on('click',()=>{
    if (value==='sysu1112') {
        $('.wrapper').addClass('active')
        window.localStorage.setItem('treeHolePassWord','sysu1112')
    } else {
        $('#POST-password').val('')
        let $error = $('.error')
        $error.addClass('active')
        if (timeId) window.clearTimeout(timeId)
        timeId = setTimeout(() => {
            $error.removeClass('active')
        }, 1500);
    }
})

let password=window.localStorage.getItem('treeHolePassWord')
if (password && password==='sysu1112'){
    $('.wrapper').addClass('active')
}