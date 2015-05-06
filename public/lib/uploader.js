function upload(){  
    var droperea =document.getElementById("dropBox");  
    var list=document.getElementById("list");  
    var txterea=document.getElementById("txterea");  
    //添加拖拽事件的监听  
    droperea.addEventListener("dragenter",function(e){  
        e.preventDefault();
        //阻止浏览器的默认行为  
        droperea.style.backgroundColor = "grey";  
    },false);  
    droperea.addEventListener("dragleave",function(e){  
        e.preventDefault();  
        droperea.style.backgroundColor = "white";  
    },false);  
    droperea.addEventListener('drop', function(e){  
        e.stopPropagation();  
        e.preventDefault();  
        droperea.style.backgroundColor = "white";  
        var fileList =e.dataTransfer.files,//获取拖拽文件  
            fileType = fileList[0].type,  
            fileName = fileList[0].name,  
            fileSize = fileList[0].size,  
            div =document.createElement('div'),  
            reader = new FileReader();  
//注意：只有在需要在页面展示图片的时候才需要使用FileReader()这个对象,  
//这个对象对文件的大小有限制，大概在500MB左右，否则会导致页面崩溃；  
  
//如果只是上传一个文件而不需要展示图片的话不需要使用这个对象  
  
//      reader.readAsDataURL(fileList[0]);//这里只取拖拽的第一个，实际中你可以遍历处理file列表  
//      reader.onload = function(e) {  
        div.src=this.result;  
        var formData = new FormData();  
        var xhr = new XMLHttpRequest();  
        //因为直接上传文件对象的时候我无法获取文件的信息所以我只能把文件的信息通过param传递过去  
        var url ="/upload?fileName=" +fileName+'&fileSize='+fileSize;  
        console.log(fileList[0]);  
        formData.append("uploadFile",fileList[0]);  
        xhr.open('POST',url, true);  
        xhr.onload = function(e) {};  
        // Listen to the uploadprogress.  
        var progressBar =document.querySelector('progress');  
        xhr.upload.onprogress = function(e) {  
            if(e.lengthComputable) {  
                var percentComplete =parseInt((e.loaded / e.total) * 100);  
                console.log("Upload: " +percentComplete + "% complete");  
                div.innerHTML="name :  "+fileName+'     ' +percentComplete + "%";  
            }  
        };  
//          xhr.send(formData); //使用multipart/form-data格式上传  
        xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");//直接发送文件对象的时候使用  
        xhr.setRequestHeader("X-File-Name",encodeURIComponent(fileName));  
        xhr.setRequestHeader("Content-Type","application/octet-stream");  
        xhr.send(fileList[0]);//直接上传文件对象，  
//          xhr.abort();//表示取消文件上传  
        list.a(div);//复制代码的时候把.a改成  
  
        txterea.style.display="none";  
//      };  
        reader.onabort=function(e){ //取消文件上传时触发  
            alert('File readcancelled');  
        };  
//其他的一些事件reader.onerror，reader.onloadstart，  
//reader.readAsBinaryString(e.target.files[0]);  
    },false);  
    droperea.addEventListener('dragover',function(e) {  
        e.stopPropagation();  
        e.preventDefault();  
    },false);  
  
}  
function abortRead() {  
    reader.abort(); // 取消浏览器读取本地文件  
}  