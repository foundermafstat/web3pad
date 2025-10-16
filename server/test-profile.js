import fetch from 'node-fetch';

async function testProfile() {
    try {
        console.log('🔍 Testing profile endpoint...');
        
        const response = await fetch('http://localhost:3001/api/profile/user_e6f410e7');
        
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Profile data:', data);
        } else {
            const error = await response.text();
            console.log('❌ Error:', error);
        }
    } catch (error) {
        console.error('❌ Request error:', error);
    }
}

testProfile();
