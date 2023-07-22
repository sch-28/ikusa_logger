; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Ikusa Logger"
#define MyAppVersion "1.2.9"
#define MyAppPublisher "sch-28"
#define MyAppURL "https://www.ikusa.site/"
#define MyAppExeName "ikusa-logger-win_x64.exe"
#define MyAppIcoName "icon-2.ico"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{43CB38E6-372B-4BC6-A2FA-EC72E1ADC671}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\Ikusa
DisableProgramGroupPage=yes
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
OutputBaseFilename=ikusa-logger-installer
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=".\logger\icon\{#MyAppIcoName}"
UninstallDisplayName="Uninstall Ikusa Logger"
UninstallDisplayIcon=".\logger\icon\{#MyAppIcoName}"
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: ".\dist\ikusa-logger\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\dist\ikusa-logger\resources.neu"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\dist\ikusa-logger\WebView2Loader.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\logger\icon\{#MyAppIcoName}"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\dist\ikusa-logger\logger\*"; DestDir: "{app}\logger\"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}";IconFilename: "{app}\{#MyAppIcoName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}";IconFilename: "{app}\{#MyAppIcoName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runascurrentuser

