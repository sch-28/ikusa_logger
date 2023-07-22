:: Build the logger
cd logger
CALL install.bat

:: Copy everything form logger/dist/logger to dist/ikusa-logger/logger/
cd .. 
xcopy logger\dist\logger dist\ikusa-logger\logger\ /E /Y

:: Build the Frontend
cd ui 
CALL npm i
CALL npm run build

:: Compile the program
cd .. 
CALL neu update
CALL neu build

:: Timeout for 2 seconds to make sure the resource is free
timeout 2 /nobreak

:: Insert Manifest
mt.exe -manifest ikusa.manifest -outputresource:dist\ikusa-logger\ikusa-logger-win_x64.exe;1

:: Compile the installer
ISCC build-setup.iss
