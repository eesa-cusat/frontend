const https = require('https');
const http = require('http');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const testEndpoint = (url, callback) => {
    console.log(`Testing: ${url}`);
    
    const protocol = url.startsWith('https:') ? https : http;
    const startTime = Date.now();
    
    const req = protocol.get(url, {
        timeout: 5000,
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Node.js Test Client'
        }
    }, (res) => {
        const duration = Date.now() - startTime;
        console.log(`✅ Response: ${res.statusCode} in ${duration}ms`);
        console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (data) {
                try {
                    const json = JSON.parse(data);
                    console.log(`   📊 JSON Data (${Object.keys(json).length} keys):`, Object.keys(json));
                    if (json.results && Array.isArray(json.results)) {
                        console.log(`   📋 Found ${json.results.length} items in results`);
                    } else if (Array.isArray(json)) {
                        console.log(`   📋 Found ${json.length} items in array`);
                    }
                    console.log(`   💾 Sample:`, JSON.stringify(json).substring(0, 200) + '...');
                } catch (e) {
                    console.log(`   ⚠️  Non-JSON response: ${data.substring(0, 200)}...`);
                }
            }
            callback();
        });
    });
    
    req.on('error', (err) => {
        const duration = Date.now() - startTime;
        console.log(`❌ Error after ${duration}ms: ${err.message}`);
        callback();
    });
    
    req.on('timeout', () => {
        console.log(`⏰ Timeout after 5000ms`);
        req.destroy();
        callback();
    });
};

const endpoints = [
    'http://localhost:8000/api/events/',
    'https://localhost:8000/api/events/',
    'http://localhost:8000/api/events/events/',
    'https://localhost:8000/api/events/events/',
    'http://localhost:8000/events/',
    'https://localhost:8000/events/',
    'http://localhost:8000/api/gallery/',
    'https://localhost:8000/api/gallery/',
];

let currentIndex = 0;

const testNext = () => {
    if (currentIndex >= endpoints.length) {
        console.log('\n🎯 Testing complete!');
        return;
    }
    
    testEndpoint(endpoints[currentIndex], () => {
        console.log('---');
        currentIndex++;
        setTimeout(testNext, 100); // Small delay between requests
    });
};

console.log('🚀 Node.js API Testing (with SSL bypass)');
console.log('==========================================\n');

testNext();
