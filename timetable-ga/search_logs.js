const fs = require('fs');
const logPath = 'C:\\Users\\shrood\\.gemini\\antigravity\\brain\\2bb500e3-633d-4dcb-abae-9401065b65e8\\.system_generated\\logs\\overview.txt';
const content = fs.readFileSync(logPath, 'utf8');

const keywords = ['testimonial', 'Professor', 'Experience', 'Smith', 'marquee', 'scroll-text'];

keywords.forEach(kw => {
    const index = content.indexOf(kw);
    if (index !== -1) {
        console.log(`Found "${kw}" at index ${index}`);
        console.log(content.substring(index - 100, index + 200));
        console.log('-------------------');
    } else {
        console.log(`"${kw}" not found`);
    }
});
