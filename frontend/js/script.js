// GET
async function GET(ticker) {
    try {
        const response = await fetch(ticker ? `/stock_data/${ticker}` : '/stock_data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

// POST
async function POST(ticker) {
    try {
        const response = await fetch(ticker ? `/stock_data/${ticker}` : '/stock_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();;
    } catch (error) {
        console.error('Error:', error);
    }
}

// DELETE
async function DELETE(ticker) {
    try {
        const response = await fetch(ticker ? `/stock_data/${ticker}` : '/stock_data', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}
