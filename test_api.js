const testApi = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Test landing page prompt' })
        });
        
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    }
};
testApi();
