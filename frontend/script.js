document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("newStock").addEventListener("click", function() {
        var ticker = document.getElementById("stockInput").value;
        
        fetch('/stock_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticker: ticker })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            
        })
        .catch(error => {
            // Handle any errors here
            console.error('Error:', error);
        });
    });
});