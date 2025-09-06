const axios = require('axios');

async function testRedirectHandling() {
    console.log('🔄 Testing HTTPS to HTTP redirect handling...\n');
    
    try {
        // Try to simulate what our frontend does
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:8000/api/events/',
            timeout: 8000,
            maxRedirects: 0, // Don't follow redirects automatically
            validateStatus: (status) => status === 200 || status === 301 || status === 302,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        console.log('First Response Status:', response.status);
        
        if (response.status === 301 || response.status === 302) {
            const location = response.headers.location;
            console.log('Redirect Location:', location);
            
            if (location && location.includes('https://')) {
                // Convert to HTTP and try again
                const httpLocation = location.replace('https://', 'http://');
                console.log('Trying HTTP version:', httpLocation);
                
                try {
                    const httpResponse = await axios({
                        method: 'GET',
                        url: httpLocation,
                        timeout: 8000,
                        maxRedirects: 0,
                        validateStatus: (status) => status === 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    });
                    
                    console.log('✅ HTTP Success:', httpResponse.status);
                    console.log('Data type:', typeof httpResponse.data);
                    console.log('Data sample:', JSON.stringify(httpResponse.data).substring(0, 200) + '...');
                    
                    return httpResponse.data;
                } catch (httpError) {
                    console.log('❌ HTTP version also failed:', httpError.response?.status || httpError.message);
                }
            }
        } else if (response.status === 200) {
            console.log('✅ Direct success!');
            return response.data;
        }
    } catch (error) {
        console.log('❌ Initial request failed:', error.response?.status || error.message);
    }
    
    // Try alternative endpoint patterns
    const alternativeEndpoints = [
        'http://localhost:8000/events/',
        'http://localhost:8000/api/events/events/',
        'http://127.0.0.1:8000/api/events/',
        'http://localhost:8000/eesa/events/',
    ];
    
    console.log('\n🔍 Trying alternative endpoints...');
    
    for (const endpoint of alternativeEndpoints) {
        try {
            console.log('Testing:', endpoint);
            const response = await axios({
                method: 'GET',
                url: endpoint,
                timeout: 5000,
                maxRedirects: 0,
                validateStatus: (status) => status === 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            console.log('✅ Alternative endpoint success:', endpoint, response.status);
            console.log('Data sample:', JSON.stringify(response.data).substring(0, 100) + '...');
            return response.data;
        } catch (error) {
            console.log('❌ Failed:', endpoint, error.response?.status || error.message);
        }
    }
    
    console.log('\n💀 All endpoints failed!');
    return null;
}

testRedirectHandling();
