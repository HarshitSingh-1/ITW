const fs = require('fs');

// 1. index.html
let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.split("dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })").join("dateObj.toLocaleDateString('en-GB')");
indexContent = indexContent.split("d.toLocaleDateString()").join("d.toLocaleDateString('en-GB')");
fs.writeFileSync('index.html', indexContent, 'utf8');

// 2. admin.html
let adminContent = fs.readFileSync('admin.html', 'utf8');
adminContent = adminContent.split("dateObj.toLocaleDateString(undefined, {month:'short', day:'numeric'})").join("dateObj.toLocaleDateString('en-GB')");
fs.writeFileSync('admin.html', adminContent, 'utf8');

// 3. history.html
let historyContent = fs.readFileSync('history.html', 'utf8');
historyContent = historyContent.split("d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })").join("d.toLocaleDateString('en-GB')");
fs.writeFileSync('history.html', historyContent, 'utf8');

// 4. wallet.html
let walletContent = fs.readFileSync('wallet.html', 'utf8');
walletContent = walletContent.split("dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })").join("dateObj.toLocaleDateString('en-GB')");
fs.writeFileSync('wallet.html', walletContent, 'utf8');

// 5. scanner.html
let scannerContent = fs.readFileSync('scanner.html', 'utf8');
scannerContent = scannerContent.split("endOfEvent.toLocaleDateString()").join("endOfEvent.toLocaleDateString('en-GB')");
fs.writeFileSync('scanner.html', scannerContent, 'utf8');

// 6. login.html layout fix
let loginContent = fs.readFileSync('login.html', 'utf8');
loginContent = loginContent.replace('<body class="premium-bg flex items-center justify-center">', '<body class="theme-bg-base min-h-screen flex items-center justify-center transition-colors duration-300">');
loginContent = loginContent.replace('text-gray-900', 'theme-text-main');
loginContent = loginContent.replace('text-gray-500', 'theme-text-muted');
loginContent = loginContent.replace('bg-white', 'theme-bg-surface');
loginContent = loginContent.replace('text-gray-700', 'theme-text-main');

const scriptInjection = `
    <script>
        const savedTheme = localStorage.getItem('app-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    </script>
    <link rel="stylesheet" href="style.css">
`;
loginContent = loginContent.replace('<link rel="stylesheet" href="style.css">', scriptInjection);

fs.writeFileSync('login.html', loginContent, 'utf8');

console.log('Successfully updated all files via Node.js!');
