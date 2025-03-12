:: Build the logger
cd logger
CALL install.bat

:: Copy everything form logger/dist/logger to dist/ikusa-logger/logger/
cd .. 
xcopy logger\dist\logger dist\ikusa-logger\logger\ /E /Y



:: Install Dependencines the Frontend
cd ui 
CALL npm i

CALL npm i -g @neutralinojs/neu@11.3.1

:: Compile the program
cd .. 
CALL neu update
CALL neu build

echo Build completed. Compiled files are in dist/ikusa-logger/