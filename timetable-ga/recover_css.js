const fs = require('fs');
const path = 'C:\\Users\\shrood\\.gemini\\antigravity\\brain\\2bb500e3-633d-4dcb-abae-9401065b65e8\\.system_generated\\logs\\overview.txt';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const line47 = lines[46];
const data = JSON.parse(line47);
const originalCSS = data.tool_calls[0].args.TargetContent;
fs.writeFileSync('d:\\Evolutionary Project\\timetable-ga\\public\\css\\style.css', originalCSS);
console.log('Original CSS restored!');
