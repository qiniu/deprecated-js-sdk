//typeof File
Qiniu = {

    //setting
    blockBits: 22,
    blockMask: (1 << this.blockBits) - 1,
    BLKSize: 4 * 1024 * 1024,

    blockCnt: function(fsize) {
        return (fsize + this.blockMask) >> this.blockBits;
    },
    chunk: function(offset, blkSize) {
        return this.chunkSize < (blkSize - offset) ? this.chunkSize : (blkSize - offset);
    },

    Progresses: new Array(),

    UploadUrl: "http://127.0.0.1:31010",

    files: '',

    fileInput: function(_fileInput) {
        return this.files = $(_fileInput).files();
    },

    token: function() {
        return '6Ua-pviUhl0k75Juee5wOxb4LxXC_iGUxJQFBtzf:1QBFZxQVfliMlI0Av_yhVFoZEx4=:eyJzY29wZSI6ImljYXR0bGVjb2RlcjM6c3Nzc3MiLCJkZWFkbGluZSI6MTQ2Mzc5MzIxN30='
    },

    onBlockPutFinished: function() {

    },

    onPutBlockFinished: function(file, blkIdex, blksize, blkCnt) {

    },

    onMkblkFinished: function(ret, file, blkIdex, offset, blkSize, blkCnt) {

    },

    onProgress: function(p) {

    },

    mkblk: function(file, blkIdex, offset, blksize, blkCnt) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.UploadUrl + "/mkblk/" + blksize, true);
        xhr.setRequestHeader("Authorization", "UpToken " + Qiniu.token());
        var cks = this.chunk(offset,blksize);
        var blob = file.slice(blkIdex * blksize, cks);
        Qiniu.chunks+=cks;
        xhr.onreadystatechange = function(response) {
            if (xhr.readyState == 4 && xhr.status == 200 && response != "") {
                var blkRet = JSON.parse(xhr.responseText);
                if (blkRet) {
                    Qiniu.onProgress(Qiniu.chunks/file.size);
                    Qiniu.Progresses[blkIdex] = blkRet;
                    if (blkRet["offset"] < offset) {
                        return
                    }

                    Qiniu.onMkblkFinished(blkRet, file, blkIdex, blkRet["offset"], blksize, blkCnt);
                }
            }
        };
        xhr.send(blob);
    },

    putRet: null,

    putblk: function(file, blkIdex, offset, blksize, preRet, blkCnt) {
        if (preRet == null) {
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.UploadUrl + "/bput/" + preRet["ctx"] + "/" + offset, true);
        xhr.setRequestHeader("Authorization", "UpToken " + Qiniu.token());
        var start = blkIdex * blksize + offset;
        var cks = this.chunk(offset, blksize)
        var end = start + cks;
        var blob = file.slice(start, end);
        Qiniu.chunks += cks; 

        xhr.onreadystatechange = function(response) {
            if (xhr.readyState == 4 && xhr.status == 200 && response != "") {
                var blkRet = JSON.parse(xhr.responseText);
                if (blkRet != null) {
                    Qiniu.onProgress(Qiniu.chunks/file.size);
                    Qiniu.Progresses[blkIdex] = blkRet;
                }
                if (blkRet["offset"] < offset) {
                    return
                }
                if (blkRet["offset"] < blksize) {
                    Qiniu.putblk(file, blkIdex, blkRet["offset"], blksize, blkRet, blkCnt);
                } else {
                    Qiniu.onBlockPutFinished(file, blkIdex, blksize, blkCnt)
                }
            }
        }
        xhr.send(blob);
    },

    chunkSize: 1024 * 256,

    chunks: 0,

    resumbalePutBlock: function(file, blkIdex, blksize, blkCnt) {

        //...n-1,n,end ,up next block
        this.onBlockPutFinished = function(file, blkIdex, blksize, blkCnt) {
            if (blkIdex < blkCnt) {
                console.log("resu=", blkIdex + 1)
                this.resumbalePutBlock(file, ++blkIdex, this.getBlksize(file.size, blkIdex), blkCnt);
            } else {
                Qiniu.mkfile(file, "icattlecoder3:sssss", file.size);
            }
        };
        this.onMkblkFinished = function(ret, file, blkIdex, offset, blksize, blkCnt) {
            //2,3,4,5,...,
            this.putblk(file, blkIdex, offset, blksize, ret, blkCnt);
        };
        //1
        this.mkblk(file, blkIdex, 0, blksize, blkCnt);
    },

    mkfile: function(file, key, fsize) {

        body = "";

        var len = Qiniu.Progresses.length;

        for (var i = 0; i < len - 1; i++) {
            body += Qiniu.Progresses[i]["ctx"];
            body += ',';
        }
        body += Qiniu.Progresses[len - 1]["ctx"];
        var xhr = new XMLHttpRequest();
        var url = this.UploadUrl + "/rs-mkfile/" + $.base64.encode(key) + "/fsize/" + fsize;
        url = url + "/mimeType/" + $.base64.encode(file.type);
        xhr.open('POST', url, true);
        xhr.setRequestHeader("Authorization", "UpToken " + Qiniu.token());
        xhr.onreadystatechange = function(response) {
            if (xhr.readyState == 4 && xhr.status == 200 && response != "") {
                var blkRet = JSON.parse(xhr.responseText);
                // console.log(blkRet);
                alert("上传成功")
            }
        }
        xhr.send(body);
    },

    Upload: function(key) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:31010/', true);
        var formData, xhr;
        f = this.files[0];
        formData = new FormData();
        formData.append('key', "ssjsuploadTests");
        formData.append('token', Qiniu.token());
        formData.append('file', f);

        xhr.onreadystatechange = function(response) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //checksum,crc32,ctx,host,offset
                var blkRet = JSON.parse(xhr.responseText);
            }
        };
        xhr.send(formData);
    },

    getBlksize: function(fsize, blkIdex) {
        return fsize > (blkIdex + 1) * this.BLKSize ? this.BLKSize : fsize - blkIdex * this.BLKSize;
    },

    ResumbleUpload: function(key) {

        f = this.files[0];

        this.Progresses.length = 0;

        size = f.size;

        blkCnt = this.blockCnt(size)

        this.chunks = 0;

        this.resumbalePutBlock(f, 0, this.getBlksize(f.size, 0), blkCnt);
    }
}
if (typeof FileReader == "undefined") {
    alert("您的浏览器未实现FileReader接口！");
}


//给jQuery提供访问FileList对象的功能
jQuery.fn.files = function() {
    return this[0].files;
};




//“显示文件信息”按钮的click事件代码
$(function() {
    $("#upladBtn").click(function(event) {
        Qiniu.onProgress = function(p) {
            // $("txt_pro").val(p)
            console.log("progress=",p)
        }
        Qiniu.fileInput("#selectFiles");
        Qiniu.ResumbleUpload("");

        return;
        var formData, xhr;

        formData = new FormData();
        formData.append('key', "jsuploadTest");
        formData.append('token', Qiniu.token());

        f = $("#selectFiles").files()[0];

        alert(f.slice(0, 100));
        return;

        formData.append('file', $("#selectFiles").files()[0]);

        xhr = new XMLHttpRequest();

        xhr.open('POST', 'http://up.qiniu.com', true);
        xhr.onreadystatechange = function(response) {};
        xhr.send(formData);

        return false;
    });
    $("#showInfoBtn").click(function(event) {
        $("#clearBtn").click();
        var fileObjs = $("#selectFiles").files();
        var sum = 0,
            count = 1;
        var tbody = $("<tbody>");
        for (var index = 0; index < fileObjs.length; index++) {
            $("<tr>").append($("<td>").append("<meter>").val(count).text(count))
                .append($("<td>").text(fileObjs[index].name))
                .append($("<td>").text(fileObjs[index].type))
                .append($("<td>").append($("<meter>").val(fileObjs[index].size).text(fileObjs[index].size / 1024)))
                .append($("<td>").text(fileObjs[index].lastModifiedDate)).appendTo(tbody);
            sum += fileObjs[index].size;
            count++;
        }
        $("td>meter, #sum").attr("max", 5 * 1024 * 1024);
        $("#info>thead").after(tbody);
        $("#count").attr("max", "10").val(fileObjs.length).text(fileObjs.length);
        $("#sum").val(sum).text(sum / 1024);
    });
});




$(function() {
    $("#clearBtn").click(function(event) {
        $("#info>tbody, #fileContent, #console").empty();
        $("#count, #sum").val(0).text(0);
    });
});



//三个按钮的click事件代码
$(function() {
    $("#txtBtn").click(function(event) {
        //$("#selectFiles").files[0].si
        // $("#selectFiles").readAsText(handler);
        //$("#selectFiles").readAsText($("#selectFiles").files(),"UTF-8");
    });

    $("#binBtn").click(function(event) {
        $("#selectFiles").readAsBinaryString(handler);
    });

    $("#urlBtn").click(function(event) {
        $("#selectFiles").readAsDataURL(handler);
    });
});


////////


//传入的事件处理器函数代码
var createTag = function(txt) {
    $("#console").append($("<span>").text(txt).after("<br/>"));
};

var handler = {
    load: function(event) {
        createTag("this is FileReader's onload event.");
        $("<p>").append(event.target.result).appendTo("#fileContent");
    },
    loadStart: function(event) {
        createTag("this is FileReader's onloadstart event.");
    },
    loadEnd: function(event) {
        createTag("this is FileReader's onloadend event.");
    },
    abort: function(event) {
        createTag("this is FileReader's onabort event.");
    },
    error: function(event) {
        createTag("this is FileReader's onerror event.");
    },
    progress: function(event) {
        createTag("this is FileReader's onprogress event.");
    }
};


var getFileReader = function(handler) {
    var reader = new FileReader();
    //var reader = FileReader(handler);

    reader.onloadstart = handler.loadStart;
    reader.onprogress = handler.progress;
    reader.onload = handler.load;
    reader.onloadend = handler.loadEnd;
    reader.onabort = handler.abort;
    reader.onerror = handler.error;
    return reader;
};


////////////

jQuery.fn.readAsText = function(handler, encoding) {
    if (typeof encoding == "undefined") {
        encoding = "UTF-8";
    }
    var files = this.files();

    var reader = null;
    for (var i = 0; i < files.length; i++) {


        //alert(files[i].name);
        reader = getFileReader(files[i]);


        if (!/text\/\w+/.test(files[i].type)) {
            reader.onload = createTag("Loading ..." + files[i].name);
            reader.loadEnd = createTag("Loading have  End!" + files[i].name);
        } else {
            reader.onload = createTag("Loading ..." + files[i].name);
            reader.readAsText(files[i], encoding);
            alert(reader.result);
            $("#fileContent").append($("<span>" + files[i].name + "<br>" + reader.result + "<br/>"));

            reader.loadEnd = createTag("Loading have  End!" + files[i].name);
        }

    }
    return this;
};



jQuery.fn.addText = function(txt) {
    var createTag = function(txt) {
        $("#console").append($("<span>").text(txt).after("<br/>"));
    }
};



jQuery.fn.readAsBinaryString = function(handler) {
    var files = this.files();
    var reader = null;
    for (var i = 0; i < files.length; i++) {
        reader = getFileReader(handler);
        reader.readAsBinaryString(files[i]);
    }
    return this;
};

jQuery.fn.readAsDataURL = function(handler) {
    var files = this.files();
    var reader = null;
    var imageHandler = function(event) {
        $("<img>").attr("src", event.target.result).appendTo("#fileContent");
    };
    for (var i = 0; i < files.length; i++) {
        reader = getFileReader(handler);
        if (!/image\/\w+/.test(files[i].type)) {
            reader.readAsDataURL(files[i]);
        } else {
            reader.onload = imageHandler;
            reader.readAsDataURL(files[i]);
        }
    }
    return this;
};
