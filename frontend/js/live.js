// logic for adding and removing stocks
document.addEventListener('DOMContentLoaded', async function() {
    const refreshRate = 5000;

    document.getElementById("newStock").addEventListener("click", async function() {
        const data = await POST(document.getElementById("stockInput").value);
        console.log("New stock: " + data);
    });
    document.getElementById("removeStock").addEventListener("click", async function() {
        const data = await DELETE(document.getElementById("stockInput").value);
        console.log("Remove stock" + data);
    });
    document.querySelector('.watchlistData').addEventListener("click", async function(event) {
        if (event.target.classList.contains("watchlistItemControlsRemove")) {
            const button = event.target;
            const ticker = button.parentElement.parentElement.querySelector(".watchlistItemDataTicker").textContent;
            button.parentElement.parentElement.style.display = "none";
            const data = DELETE(ticker);
            console.log("Remove stock button" + data);
        } else {
            console.error("Event target is not a remove button:", event.target);
        }
    });

    var initialData = await GET();
    displayData(initialData, null);
    startUpdateCycle(initialData, refreshRate);
});

async function extractData(data) {
    const array = [];
    if (Array.isArray(data)) {
        data.forEach(item => {
            const ticker = item.ticker;
            const openPrice = item.data.Open[Object.keys(item.data.Open)[Object.keys(item.data.Open).length - 1]];
            const highPrice = item.data.High[Object.keys(item.data.High)[Object.keys(item.data.High).length - 1]];
            array.push([ticker, openPrice, highPrice]);
        });
    } else {
        console.error("Data is not an array:", data);
    }
    return array;
}

// logic for displaying stock data
async function displayData(data, previousData) {
    try {
        const extractedData = await extractData(await data);
        const watchlistContainer = document.querySelector('.watchlistData');
        watchlistContainer.innerHTML = '';

        for (var i = 0; i < extractedData.length; i++) {
            const ticker = extractedData[i][0];
            const openPrice = extractedData[i][1];
            const highPrice = extractedData[i][2];
            const changePrice = highPrice - openPrice;
            const changePercentage = await calculateChangePercentage(openPrice, highPrice);
            if (ticker === undefined || openPrice === undefined || highPrice === undefined) {
                console.error("Data is undefined:", ticker, openPrice, highPrice);
                throw new Error("Data is undefined: " + ticker + ", " + openPrice + ", " + highPrice);
            }
            watchlistContainer.innerHTML += `
                <div class="watchlistItem">
                    <div class="watchlistItemData">
                        <div class="watchlistItemDataTicker">${ticker}</div>
                        <div class="watchlistItemDataPrice">${highPrice.toFixed(2)}</div>
                        <div class="watchlistItemDataOpen">${changePrice.toFixed(2)}</div>
                        <div class="watchlistItemDataChange">${changePercentage}</div>
                    </div>
                    <div class="watchlistItemControls">
                        <button class="watchlistItemControlsRemove">x</button>
                    </div>
                </div>
            `;
            if (previousData === null) {
                console.error("Undefined: first cycle? otherwise error");
                styleCards(extractedData, highPrice);
            } else {
                styleCards(previousData, highPrice);
            }
        }

        function calculateChangePercentage(openPrice, highPrice) {
            const change = highPrice - openPrice;
            const percentage = (change / openPrice) * 100;
            return percentage.toFixed(2) + '%';
        }

        function styleCards(previousData, highPrice) {
            const previousPrice = previousData[i][2];
            let factor = highPrice / previousPrice;
      
            cardElement = document.querySelector('.watchlistItem:nth-child(' + (i + 1) + ')');
            cardElement.classList.add(factor > 1 ? 'flash-green' : factor < 1 ? 'flash-red' : 'flash-grey');
            setTimeout(() => {
                document.querySelectorAll('.watchlistItem').forEach(card => {
                    card.classList.remove('flash-green', 'flash-red', 'flash-grey');
                });
            }, 500);
        }
    } catch (error) {
        console.error("Error extracting data:", error);
    }
}

async function startUpdateCycle(initialData, refreshRate) {
    let previousData = initialData;
    setInterval(async function() {
        const data = await GET();
        console.log(previousData);
        displayData(data, previousData);
        previousData = await extractData(data);
    }, refreshRate);
}