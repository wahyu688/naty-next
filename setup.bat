@echo off
echo Setting up NATY Next.js project structure...

REM Create directories
mkdir src\app\timeline 2>nul
mkdir src\app\works 2>nul
mkdir src\app\contact 2>nul
mkdir src\components\layout 2>nul
mkdir src\components\sections 2>nul
mkdir src\components\ui 2>nul
mkdir src\lib 2>nul
mkdir src\styles 2>nul
mkdir public 2>nul

echo.
echo Done! Folder structure created.
echo.
echo Now copy your .tsx and .ts files into the correct folders:
echo.
echo   layout.tsx         → src\app\
echo   page.tsx           → src\app\
echo   timeline\page.tsx  → src\app\timeline\
echo   timeline\TimelineClient.tsx → src\app\timeline\
echo   works\page.tsx     → src\app\works\
echo   works\WorksClient.tsx → src\app\works\
echo   contact\page.tsx   → src\app\contact\
echo   contact\ContactClient.tsx → src\app\contact\
echo   Navbar.tsx         → src\components\layout\
echo   Footer.tsx         → src\components\layout\
echo   HeroSection.tsx    → src\components\sections\
echo   AboutSection.tsx   → src\components\sections\
echo   TeamSection.tsx    → src\components\sections\
echo   ProjectsSection.tsx → src\components\sections\
echo   SkillsSection.tsx  → src\components\sections\
echo   ContactCTA.tsx     → src\components\sections\
echo   ui\index.tsx       → src\components\ui\
echo   data.ts            → src\lib\
echo   globals.css        → src\styles\
echo.
pause
