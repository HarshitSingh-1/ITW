const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');

// Fix dark mode text visibility (issue 2 from previous step)
indexContent = indexContent.replace(/text-gray-900/g, 'theme-text-main');

// Show price on event cards
const oldCardPriceStr = 'mt-1">${dateObj.toLocaleDateString(\'en-GB\')} • ${event.venue}</p>';
const newCardPriceStr = 'mt-1 flex justify-between">\n                                        <span>${dateObj.toLocaleDateString(\'en-GB\')} • ${event.venue}</span>\n                                        <span class="text-green-400">${event.price && event.price > 0 ? \'₹\' + event.price : \'Free\'}</span>\n                                    </p>';
indexContent = indexContent.split(oldCardPriceStr).join(newCardPriceStr);

fs.writeFileSync('index.html', indexContent, 'utf8');
console.log('Successfully applied extra fixes via Node.js!');
