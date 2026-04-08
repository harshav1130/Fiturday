const https = require('https');

async function testUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(`${res.statusCode} -> ${url}`);
        }).on('error', (e) => resolve(`Error -> ${url}`));
    });
}

async function run() {
    const urls = [
        "https://raw.githubusercontent.com/XZE3N/ExerciseGifDownloader/main/GIFs/Leg%20Press.gif",
        "https://raw.githubusercontent.com/XZE3N/ExerciseGifDownloader/main/GIFs/Cable%20Crunch.gif",
        "https://raw.githubusercontent.com/XZE3N/ExerciseGifDownloader/main/GIFs/Plank.gif",
        "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.jpg",
        "https://raw.githubusercontent.com/justinmahar/react-bits/master/README.md"
    ];
    for (const u of urls) {
        console.log(await testUrl(u));
    }
}
run();
