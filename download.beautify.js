(function() {
    "use strict";
    var win;
    var doc;
    var list;
    var index = 0;
    var photos = [];
    var fileArray = [];
    var waitInterval;
    waitInterval = prompt("Please enter checker wait interval! (ms)");
    if (isNaN(waitInterval) || "" === waitInterval) {
        waitInterval = 5e3;
    } else {
        waitInterval = +waitInterval;
    }
    var saveUrl = function(fileName, url) {
        var elem = window.document.createElement("a");
        elem.href = url;
        elem.download = fileName;
        elem.click();
    };
    var saveFile = function(fileName, data) {
        var blob = new Blob([ data ], {
            type: "text/plain"
        });
        var elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = fileName;
        elem.click();
    };
    var makeDownloadUrl = function(e) {
        e = e.replace(/&t=\d+/, "");
        return e;
        var t = "save=1&d=1";
        if (e && e.indexOf("?") > 0) {
            e = e + "&" + t;
        } else if (e) {
            e = e + "?" + t;
        }
        return e;
    };
    var add2fileArray = function(photo) {
        var fileName;
        var nameFragment = photo.ownerName.replace(/_/gi, "-") + "_" + photo.topicName.replace(/_/gi, "-") + "_" + photo.name.replace(/_/gi, "-") + "_" + photo.picKey.replace(/_/gi, "-");
        nameFragment = nameFragment.replace(/\./gi, "&#046");
        if (1 === photo.raw_upload) {
            fileName = nameFragment + "_raw";
            fileArray.push({
                fileName: fileName,
                url: makeDownloadUrl(photo.raw)
            });
        } else if (photo.origin) {
            fileName = nameFragment + "_origin";
            fileArray.push({
                fileName: fileName,
                url: makeDownloadUrl(photo.origin)
            });
        } else if (photo.downloadUrl) {
            fileName = nameFragment + "_downloadUrl";
            fileArray.push({
                fileName: fileName,
                url: makeDownloadUrl(photo.downloadUrl)
            });
        } else {
            fileName = nameFragment + "_url";
            fileArray.push({
                fileName: fileName,
                url: makeDownloadUrl(photo.url)
            });
        }
    };
    var downloadAll = function(fileArray) {
        var interval = prompt("Please enter file download interval! (ms)");
        if (isNaN(interval) || "" === interval) {
            interval = 2e3;
        } else {
            interval = +interval;
        }
        for (var i = 0; i < fileArray.length; ++i) {
            var file = fileArray[i];
            var wiper = function(file) {
                return function() {
                    saveUrl(file.fileName, file.url);
                };
            };
            setTimeout(wiper(file), interval * i);
        }
    };
    var waituntil = function(checker, callback, delay) {
        if (!delay) delay = 100;
        if (checker()) {
            callback();
        } else {
            setTimeout(function() {
                waituntil(checker, callback, delay);
            }, delay);
        }
    };
    var downloadAlbum = function(callback) {
        var interval1 = setInterval(function() {
            var random = Math.floor(Math.random() * 10);
            win.document.getElementsByClassName("j-pl-photoitem-imgctn")[random].click();
        }, waitInterval);
        waituntil(function() {
            var ele = jQuery("#js-viewer-container");
            if (!ele || !ele.length) return false;
            return "none" != ele.css("display");
        }, function() {
            clearInterval(interval1);
            var interval2 = setInterval(function() {
                jQuery("#js-thumb-next>a")[0].click();
            }, waitInterval);
            waituntil(function() {
                if (!window.slide || !slide.picTotal || !slide.photos) return false;
                for (var i = 0; i < slide.photos.length; ++i) {
                    var whetherAdd = true;
                    for (var ii = 0; ii < photos.length; ++ii) {
                        if (photos[ii].picKey === slide.photos[i].picKey) {
                            whetherAdd = false;
                            break;
                        }
                    }
                    if (whetherAdd) photos.push(slide.photos[i]);
                }
                return photos.length === slide.picTotal;
            }, function() {
                clearInterval(interval2);
                jQuery(".photo_layer_close>a").click();
                for (var i = 0; i < photos.length; ++i) {
                    add2fileArray(photos[i]);
                }
                photos = [];
                callback();
            }, waitInterval);
        }, waitInterval);
    };
    var beginDownload = function() {
        if (confirm("Whether download fileArray!")) {
            saveFile(slide.photos[0].ownerName + "(" + slide.photos[0].ownerUin + ")_" + "fileArray.json", JSON.stringify(fileArray));
        }
        if (confirm("Whether download all picture!" + "\n" + "total items:" + fileArray.length)) downloadAll(fileArray);
    };
    if ("0" === jQuery("#QM_Profile_Photo_Cnt").text()) {
        alert("this QZone not have photo!");
    }
    var photoButton = jQuery("#QM_Profile_Photo_A")[0];
    if (photoButton) photoButton.click(); else if (!confirm("Not find photo button! whether continune?")) return;
    waituntil(function() {
        var iframe = document.getElementById("tphoto");
        if (!iframe) return false;
        win = iframe.contentWindow || iframe;
        doc = win.document;
        list = jQuery(".js-album-list-ul>li", doc);
        if (!list.length) return false;
        return true;
    }, function() {
        var download_loop = function() {
            if (index >= list.length) {
                window.fileArray = fileArray;
                var downloadButton = jQuery(".top-nav>.nav-list:last>div>a").unbind("click");
                downloadButton.html("Download");
                downloadButton.click(beginDownload);
                return;
            }
            var album = list[index];
            var img = jQuery(".js-cover-img", album);
            if (-1 != img.attr("onload").indexOf("http://qzonestyle.gtimg.cn/aoi/img/photo/logic/pwd.png") || -1 != img.attr("onload").indexOf("http://qzonestyle.gtimg.cn/aoi/img/photo/logic/pic-none.png")) {
                ++index;
                download_loop();
                return;
            }
            img.click();
            waituntil(function() {
                doc = win.document;
                var list = jQuery(".list.j-pl-photolist-ul", doc);
                if (!list.length) {
                    var ele = jQuery("#js-viewer-container");
                    if (!ele || !ele.length) return false;
                    return "none" != ele.css("display");
                }
                return true;
            }, function() {
                doc = win.document;
                downloadAlbum(function() {
                    doc = win.document;
                    ++index;
                    jQuery(".c-tx2.js-select", doc)[0].click();
                    list = null;
                    waituntil(function() {
                        doc = win.document;
                        list = jQuery(".js-album-list-ul>li", doc);
                        if (!list.length) return false;
                        return true;
                    }, function() {
                        download_loop();
                    }, waitInterval);
                });
            }, waitInterval);
        };
        download_loop();
    }, waitInterval);
})();