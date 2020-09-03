@echo off
@call "S:\ApplicationBinary\_ApplicationEnvironment\_SAE.bat"
call Uglifyjs download.js -c -o download.min.js
call Uglifyjs download.js -c -m -o download.min.mangle.js
call Uglifyjs download.js -b -o download.beautify.js
pause;
