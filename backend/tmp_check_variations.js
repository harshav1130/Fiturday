const urls = [
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/leg-press.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/leg_press.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2023/02/Leg-Press.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunches.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/cable-crunch.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif',
    'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank-Exercise.gif'
];

async function run() {
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`${res.status} -> ${url}`);
        } catch (e) {
            console.log(`Error: ${e.message} -> ${url}`);
        }
    }
}
run();
