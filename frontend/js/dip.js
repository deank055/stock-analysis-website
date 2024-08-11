// Logic for the dip page: fetching information, display data graphically
document.addEventListener('DOMContentLoaded', async function() {
    createChart(await extractData(await GET()));
});

async function extractData(data) {
    const dictionary = {};
    if (Array.isArray(data)) {
        data.forEach(item => {
            const ticker = item.ticker;
            const highPrice = item.data.High[Object.keys(item.data.High)[Object.keys(item.data.High).length - 1]];
            const MA200day = item.data['200dMA'];
            const factor = highPrice / MA200day;
            dictionary[ticker] = factor - 1;
        });
    } else {
        console.error("Data is not an array:", data);
    }
    return dictionary;
}

function createChart(data) {
    const sortedData = Object.entries(data).sort((a, b) => a[1] - b[1]);

    function getColor(factor, minFactor, maxFactor) {
        const ratio = (factor - minFactor) / (maxFactor - minFactor);   // ranges from 0 to 1
        let red, green, blue;
        const brightness = 255;
        console.log(ratio);
        if (ratio > 0.5) {
            red = Math.round(brightness * 2 * (1 - ratio));
            green = brightness;
            blue = Math.round(brightness * 2 * (1 - ratio));
            console.log(red, green, blue);
        } else {
            red = brightness;
            green = Math.round(brightness * 2 * ratio);
            blue = Math.round(brightness * 2 * ratio);
        }
        return `rgb(${red},${green},${blue})`;
    }

    const factors = sortedData.map(([_, factor]) => factor);
    const minFactor = Math.min(...factors);
    const maxFactor = Math.max(...factors);

    var chart = new CanvasJS.Chart("graph", {
        animationEnabled: true,
        title: {
            text: "200dMA vs High Price"
        },
        axisY: {
            interval: 10,
            suffix: "%"
        },
        data: [{
            type: "column",
            toolTipContent: "<b>{label}</b><br>Factor: {y}%",
            dataPoints: sortedData.map(([ticker, factor]) => ({
                label: ticker,
                y: factor * 100,
                color: getColor(factor, minFactor, maxFactor)
            }))
        }]
    });

    chart.render();
}
