const expectedUrls = {
    'Leg Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
    'Overhead Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Barbell-Shoulder-Press.gif',
    'Bulgarian Split Squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bulgarian-Split-Squat.gif',
    'Plank': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif',
    'Seated Dumbbell Shoulder Press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Dumbbell-Press.gif',
    'Cable Crunches': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif'
};

async function run() {
    for (const [name, url] of Object.entries(expectedUrls)) {
        try {
            const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`${res.status} -> ${name}`);
        } catch (e) {
            console.log(`Error: ${e.message} -> ${name}`);
        }
    }
}
run();
