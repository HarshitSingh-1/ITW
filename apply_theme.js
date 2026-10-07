const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Body
html = html.replace(/<body class="[^"]*">/, '<body class="bg-slate-950 text-slate-300 min-h-screen">');

// Navbar
html = html.replace('bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-gray-100/50', 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800');
html = html.replace('text-gray-500 hover:text-gray-900', 'text-slate-400 hover:text-white');
html = html.replace('text-gray-500 hover:text-gray-900', 'text-slate-400 hover:text-white');
html = html.replace('bg-gray-100 hover:bg-gray-200 text-gray-700', 'bg-slate-800 hover:bg-slate-700 text-slate-200');

// Search & Filter
html = html.replace('class="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow"', 'class="block w-full pl-11 pr-4 py-3 border border-slate-800 bg-slate-900 text-white placeholder-slate-500 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow"');
html = html.replace('text-gray-400', 'text-slate-500'); // icons
html = html.replace('bg-gray-900 text-white', 'bg-blue-600 text-white'); // active chip
html = html.replace(/bg-gray-100 text-gray-600 hover:bg-gray-200/g, 'bg-slate-800 text-slate-300 hover:bg-slate-700'); // inactive chips

// Typography (Headers)
html = html.replace(/text-gray-900/g, 'text-white');
html = html.replace(/text-gray-800/g, 'text-slate-200');
html = html.replace(/text-gray-700/g, 'text-slate-300');
html = html.replace(/text-gray-600/g, 'text-slate-400');
html = html.replace(/text-gray-500/g, 'text-slate-400');
html = html.replace(/text-gray-400/g, 'text-slate-500');
html = html.replace(/text-gray-300/g, 'text-slate-400');

// Borders & Backgrounds
html = html.replace(/border-gray-100/g, 'border-slate-800');
html = html.replace(/border-gray-200/g, 'border-slate-800');
html = html.replace(/bg-gray-50/g, 'bg-slate-900');
html = html.replace(/bg-white/g, 'bg-slate-900'); 

// Specific overrides for UI depth
html = html.replace('bg-slate-900 rounded-2xl shadow-xl', 'bg-slate-900 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800');
html = html.replace('bg-blue-50 border border-blue-100', 'bg-slate-800 border border-slate-700');
html = html.replace('bg-yellow-50 rounded-xl p-5 mb-8 border border-yellow-100', 'bg-slate-800 rounded-xl p-5 mb-8 border border-slate-700');
html = html.replace(/border-yellow-200/g, 'border-slate-700');
html = html.replace('bg-slate-900/90', 'bg-slate-950/90'); // Sticky booking bar
html = html.replace('bg-slate-900 text-white font-bold py-2 px-5', 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5'); // Post Comment
html = html.replace('bg-slate-900 text-white font-bold py-2 px-6', 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6'); // Post Review

fs.writeFileSync('index.html', html);
console.log('Transformation complete!');
