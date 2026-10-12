const https = require('https');

const API_KEY = process.env.WEATHER_API_KEY;
const CITY = 'Bandarawela';
if (!API_KEY) throw new Error('Set WEATHER_API_KEY before running this script.');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function test() {
    console.log(`Testing weather for ${CITY}...`);
    try {
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`;

        const currentData = await get(currentUrl);
        console.log('Current Weather:', JSON.stringify(currentData, null, 2).substring(0, 500) + '...');

        const forecastData = await get(forecastUrl);
        if (forecastData.list) {
            console.log('Forecast List Length:', forecastData.list.length);
            console.log('First Forecast Item:', JSON.stringify(forecastData.list[0], null, 2));
        } else {
            console.log('Forecast Error:', JSON.stringify(forecastData, null, 2));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
