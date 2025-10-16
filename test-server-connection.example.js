// Simple test to check server connection
const testServerConnection = async () => {
    const urls = [
        'http://localhost:3001/api/auth/leather',
        'http://YOUR_LOCAL_IP:3001/api/auth/leather'
    ];

    for (const url of urls) {
        try {
            console.log(`Testing: ${url}`);
            const response = await fetch(url, {
                method: 'OPTIONS',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(`✅ Success: ${url} - Status: ${response.status}`);
        } catch (error) {
            console.log(`❌ Failed: ${url} - Error: ${error.message}`);
        }
    }
};

testServerConnection();
