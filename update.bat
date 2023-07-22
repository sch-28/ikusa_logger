@echo off
setlocal

REM Check if the version number argument is provided
if "%~1"=="" (
    echo Error: Version number argument is missing.
    exit /B 1
)

REM Save the version number argument to a variable
set "VERSION=%~1"

REM GitHub repository details
set "REPO_OWNER=sch-28"
set "REPO_NAME=ikusa_logger"
set "ASSET_NAME=ikusa-logger-installer.exe"


REM Temporary location to save the downloaded file
set "TEMP_DIR=%TEMP%\%RANDOM%"
mkdir "%TEMP_DIR%"
set "EXECUTABLE_PATH=%TEMP_DIR%\%ASSET_NAME%"

REM Download the release asset from GitHub
set "DOWNLOAD_URL=https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/%VERSION%/%ASSET_NAME%"
echo Downloading %ASSET_NAME% from %DOWNLOAD_URL%...
curl -L -o "%EXECUTABLE_PATH%" "%DOWNLOAD_URL%" || (
    echo Failed to download %ASSET_NAME%
    goto :cleanup
)

REM Execute the downloaded executable
echo Executing %ASSET_NAME%...
"%EXECUTABLE_PATH%"

:cleanup
REM Clean up temporary directory
if exist "%TEMP_DIR%" (
    rmdir /s /q "%TEMP_DIR%"
)

echo Script execution completed.
