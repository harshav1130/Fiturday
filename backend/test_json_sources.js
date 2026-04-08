const fs = require('fs');
const https = require('https');

async function testUrl(url) {
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log(`SUCCESS: ${url} (length: ${data.length})`);
            if (data.length > 0) {
                console.log(JSON.stringify(data[0]));
            }
            return data;
        }
    } catch(e) {}
    return null;
}

async function run() {
    const urlsToTest = [
        "https://raw.githubusercontent.com/wrkout/exercises.json/master/exercises.json",
        "https://raw.githubusercontent.com/justinmahar/exercise-db/master/exercises.json",
        "https://raw.githubusercontent.com/ascxcns/ExerciseDB/master/exercises.json",
        "https://raw.githubusercontent.com/XZE3N/ExerciseGifDownloader/main/exercises.json"
    ];

    for (const u of urlsToTest) {
        const d = await testUrl(u);
        if (d && d.length > 0 && JSON.stringify(d).includes('.gif')) {
            console.log(`FOUND GIFS IN ${u}!`);
            break;
        }
    }
}
run();
