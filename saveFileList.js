var saveFile=function(fileName, data) {
	var blob = new Blob([data], {type: 'text/plain'});
	var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    elem.click();
};

saveFile('fileArray.josn',JSON.stringify(fileArray));







