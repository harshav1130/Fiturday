const https = require('https');

async function getGifFromHTML(url) {
    return new Promise((resolve) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/https:\/\/fitnessprogramer\.com\/wp-content\/uploads\/[^"']+\.gif/i);
                resolve(match ? match[0] : "Not found");
            });
        }).on('error', () => resolve("Error"));
    });
}

async function run() {
    const pages = [
        "https://fitnessprogramer.com/exercise/cable-crunch/",
        "https://fitnessprogramer.com/exercise/leg-press/",
        "https://fitnessprogramer.com/exercise/plank/",
        "https://fitnessprogramer.com/exercise/seated-dumbbell-shoulder-press/",
        "https://fitnessprogramer.com/exercise/bulgarian-split-squat/",
        "https://fitnessprogramer.com/exercise/overhead-press/"
    ];
    for (const p of pages) {
        console.log(`${p} -> ${await getGifFromHTML(p)}`);
    }
}
run();
