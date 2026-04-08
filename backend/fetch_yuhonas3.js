const fs = require('fs');
const https = require('https');

async function run() {
    try {
        const res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
        const exercises = await res.json();
        
        const exercisesToFind = [
            "Barbell Bench Press", "Incline Dumbbell Press", "Squat", "Leg Press", 
            "Deadlift", "Lat Pulldown", "Overhead Press (OHP)", "Lateral Raise", 
            "Barbell Curl", "Triceps Pushdown", "Bulgarian Split Squat", "Pec Deck Fly", 
            "Seated Cable Row", "Plank", "Russian Twist", "Pull-up", 
            "Leg Extension", "Seated Dumbbell Shoulder Press", "Hammer Curl", "Cable Crunches"
        ];
        
        let out = "";
        for (const target of exercisesToFind) {
            let search = target.toLowerCase().replace(' (ohp)', '').replace('triceps', 'triceps').replace(' cable ', ' ').replace('crunches', 'crunch');
            
            if (target === "Squat") search = "barbell squat";
            if (target === "Deadlift") search = "barbell deadlift";
            if (target === "Overhead Press (OHP)") search = "seated barbell military press";
            if (target === "Lateral Raise") search = "dumbbell lateral raise";
            if (target === "Pec Deck Fly") search = "butterfly";
            if (target === "Pull-up") search = "pull-up";
            if (target === "Seated Dumbbell Shoulder Press") search = "dumbbell seated shoulder press";

            let found = exercises.find(e => e.name.toLowerCase() === search);
            if (!found) found = exercises.find(e => e.name.toLowerCase().includes(search));
            if (!found) found = exercises.find(e => search.includes(e.name.toLowerCase()));
            
            if (found) {
                // Find a gif if possible, fallback to jpg
                let img = found.images.find(i => i.endsWith('.gif')) || found.images[0];
                const url = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`;
                out += `${target}|${url}\n`;
            } else {
                out += `${target}|MISSING\n`;
            }
        }
        fs.writeFileSync('v:\\FITURDAY\\backend\\mapped_urls.txt', out);
    } catch(e) {
        console.error(e);
    }
}
run();
