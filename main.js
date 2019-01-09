var APP_ID = '3PHoxuk9H0YVScbvPPD5vIku-gzGzoHsz';
var APP_KEY = 'cqldnwiVXqqa4q38d0hb5Maa';
var messageList=[]
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
var query=new AV.Query('Message')



let $messageList=$('#messageList')
query.descending("createdAt").find().then((message)=>{
    console.log('message',message)
    message.forEach((value,index)=>{
        console.log(value)
        let id=value.id
        let time=moment(value.createdAt).format('YYYY-MM-DD')
        let {userName,content}=value.attributes
        messageList.push({time,userName,content,id})
        let $li=$('<li class="message"></li>')
        $messageList.append($li)
        let $spanUser=$(`<span class="userName">${userName}</span>`)
        let $spanContent=$(`<span class="content">${content}</span>`)
        let $spanTime=$(`<span class="time">${time}</span>`)
        let $messageBox=$('<div class="messageBox"></div>')
        let $buttonBox=$('<div class="buttonBox"><button class="deleted">删除</button><button class="addToTree">添加到树洞</button></div>')
        
        
        if (value.attributes.show){
            $($buttonBox.children()[1]).text('已添加至树洞').attr('disabled','disabled').addClass('disabled')
        } else {
            $($buttonBox.children()[1]).on('click',(e)=>{
                // 第一个参数是 className，第二个参数是 objectId
                var todo = AV.Object.createWithoutData('Message', id);
                // 修改属性
                todo.set('show',true);
                // 保存到云端
                todo.save().then(()=>{
                    $($buttonBox.children()[1]).text('已添加至树洞').attr('disabled','disabled').addClass('disabled')
                })
            })
        }
        $messageBox.append($spanTime,$spanUser,$spanContent)
        $li.append($messageBox,$buttonBox)
        $buttonBox.on('click','.deleted',(e)=>{
            let $deletedButton=$(e.currentTarget)
            let $parentList=$deletedButton.parents('.message')
            let index=$parentList.index()
            let deletedId=messageList[index].id
            var todo = AV.Object.createWithoutData('Message', deletedId)
            todo.destroy().then(function (success) {
                // 删除成功
                alert('删除成功！')
                $parentList.remove()
                messageList.splice(index,1)
            }, function (error) {
                // 删除失败
                alert('删除失败，请重试！')
            })
        })
    })
    console.log(messageList)
})

