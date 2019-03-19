
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
        let deletedTittle,addToTreeTittle
        let deletedClass = ''
        let addToTreeClass = ''
        let deletedStatus,addToTreeStatus
        if (value.attributes.show) {
            if (value.attributes.expire) {
                addToTreeTittle = '留言已过期'
                deletedTittle = '审核已通过'
                addToTreeClass = 'expire'
            } else {
                addToTreeTittle = '撤下留言'
                deletedTittle = '审核已通过'
                addToTreeClass = 'warn'
            }
            deletedClass = 'disabled'
        } else {
            if (value.attributes.expire) {
                addToTreeTittle = '审核不通过'
                deletedTittle = '立即删除'
                addToTreeClass = 'disabled'
            } else {
                addToTreeTittle = '通过审核'
                deletedTittle = '不通过审核'
            }
        }
        $buttonBox = $(`<div class="buttonBox"><button class="deleted ${deletedClass}"  ${deletedClass}>${deletedTittle}</button><button class="addToTree ${addToTreeClass}" ${addToTreeClass}>${addToTreeTittle}</button></div>`)

        $messageBox.append($spanTime, $spanUser, $spanContent, $spanPicLength)
        $li.append($messageBox, $buttonBox)
        $buttonBox.on('click', '.deleted', (e) => {
            let $deletedButton = $(e.currentTarget)
            console.log($deletedButton.text())
            let $parentList = $deletedButton.parents('.message')
            let index = $parentList.index()
            console.log('删除', messageList[index])
            let deletedId = messageList[index].id
            if ($deletedButton.text() === '不通过审核') {
                var todo = AV.Object.createWithoutData('message', id);
                // 修改属性
                todo.set('expire', true);
                // 保存到云端
                todo.save().then(() => {
                    $($buttonBox.children()[0]).text('立即删除')
                    $($buttonBox.children()[1]).text('审核不通过').addClass('disabled').attr('disabled',true)
                })
            } else {
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
            }
        })
        $($buttonBox.children()[1]).on('click', (e) => {
            // 第一个参数是 className，第二个参数是 objectId
            if (value.attributes.show && !value.attributes.expire) {
                var todo = AV.Object.createWithoutData('message', id);
                // 修改属性
                todo.set('expire', true);
                // 保存到云端
                todo.save().then(() => {
                    $($buttonBox.children()[1]).text('留言已过期').removeClass('warn').addClass('expire')
                    value.attributes.expire = true
                })
            } else if (!value.attributes.show) {
                var todo = AV.Object.createWithoutData('message', id);
                // 修改属性
                todo.set('show', true);
                // 保存到云端
                todo.save().then(() => {
                    $($buttonBox.children()[1]).text('撤下留言').addClass('warn')
                    $($buttonBox.children()[0]).text('审核已通过').addClass('disabled').attr('disabled',true)
                    value.attributes.show = true
                })
            }
        })
    })
})
let value
let timeId
$('#POST-password').on('input', (e) => {
    value = e.target.value
})
$('#submitButton').on('click', () => {
    checkPassword()
})
document.addEventListener('keypress', keypressHandle)
function keypressHandle(e) {
    if (e.key === 'Enter') {
        checkPassword()
    }
}
function checkPassword() {
    if (value === 'sysu1112') {
        $('.wrapper').addClass('active')
        document.removeEventListener('keypress', keypressHandle)
        window.localStorage.setItem('treeHolePassWord', 'sysu1112')
    } else {
        $('#POST-password').val('')
        let $error = $('.error')
        $error.addClass('active')
        if (timeId) window.clearTimeout(timeId)
        timeId = setTimeout(() => {
            $error.removeClass('active')
        }, 1500);
    }
}
let password = window.localStorage.getItem('treeHolePassWord')
if (password && password === 'sysu1112') {
    $('.wrapper').addClass('active')
    document.removeEventListener('keypress', keypressHandle)
}