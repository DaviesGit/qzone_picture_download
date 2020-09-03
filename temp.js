var findUrl=function(fileNameFragment){
	for(var i=0;i<fileArray.length;++i){
		var file=fileArray[i];
		if(-1!=file.fileName.indexOf(fileNameFragment)){
			console.log(file);
			console.log(file.url);
		}
	}
}