
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
        let id = value.id
        let userName = messageData.nickName
        let content = messageData.value
        let files = messageData.files
        let time = getDateDiff(new Date(value.createdAt).getTime())
        let picLength = files.length
        messageList.push({ time, userName, content, id, files, picLength })
        let $li = $('<li class="message"></li>')
        $messageList.append($li)
        let $spanUser = $(`<span class="userName">${userName}</span>`)
        let $spanContent = $(`<span class="content">${content}</span>`)
        let $spanTime = $(`<span class="time">${time}</span>`)
        let $spanPicLength = $(`<span class="picLength    ">${picLength}</span>`)
        let $messageBox = $('<div class="messageBox"></div>')
        let $buttonBox = $('<div class="buttonBox"><button class="deleted">删除</button>')
        $messageBox.append($spanTime, $spanUser, $spanContent, $spanPicLength)
        $li.append($messageBox, $buttonBox)
        $buttonBox.on('click', '.deleted', (e) => {
            let $deletedButton = $(e.currentTarget)
            let $parentList = $deletedButton.parents('.message')
            let index = $parentList.index()
            console.log('删除', messageList[index])
            let deletedId = messageList[index].id
            var todo = AV.Object.createWithoutData('message', deletedId)
            todo.destroy().then(function (success) {
                // 删除成功
                let array=messageList[index].files.map((value) => {
                    let picID = value.picID
                    var file = AV.File.createWithoutData(picID);
                    return file.destroy()
                })
                Promise.all(array).then((success)=>{
                    console.log('删除成功！')
                    $parentList.remove()
                    messageList.splice(index, 1)
                })
            }, function (error) {
                // 删除失败
                alert('删除失败，请重试！')
            })
        })
    })
})

