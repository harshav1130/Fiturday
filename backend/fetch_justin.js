const fs = require('fs');

async function run() {
    try {
        console.log("Fetching JustinMahar's exercise-db JSON...");
        const res = await fetch("https://raw.githubusercontent.com/justinmahar/exercise-db/master/exercises.json");
        const exercises = await res.json();
        
        console.log(`Loaded ${exercises.length} exercises from justinmahar/exercise-db.`);
        
        const exercisesToFind = [
            "Barbell Bench Press", "Incline Dumbbell Press", "Squat", "Leg Press", 
            "Deadlift", "Lat Pulldown", "Overhead Press", "Lateral Raise", 
            "Barbell Curl", "Triceps Pushdown", "Bulgarian Split Squat", "Pec Deck Fly", 
            "Seated Cable Row", "Plank", "Russian Twist", "Pull-up", 
            "Leg Extension", "Seated Dumbbell Shoulder Press", "Hammer Curl", "Cable Crunches"
        ];
        
        let out = "";
        for (const target of exercisesToFind) {
            let search = target.toLowerCase().replace(' (ohp)', '').replace(' cable ', ' ').replace('crunches', 'crunch');
            if (target === "Squat") search = "barbell squat";
            if (target === "Deadlift") search = "barbell deadlift";
            if (target === "Overhead Press") search = "seated barbell shoulder press";
            if (target === "Lateral Raise") search = "dumbbell lateral raise";
            if (target === "Pec Deck Fly") search = "butterfly";
            if (target === "Pull-up") search = "pull-up";
            if (target === "Seated Dumbbell Shoulder Press") search = "dumbbell seated shoulder press";

            let found = exercises.find(e => e.name.toLowerCase() === search);
            if (!found) found = exercises.find(e => e.name.toLowerCase().includes(search));
            if (!found) found = exercises.find(e => search.includes(e.name.toLowerCase()));
            
            if (found) {
                out += `${target}|${found.gifUrl}\n`;
            } else {
                out += `${target}|MISSING\n`;
            }
        }
        fs.writeFileSync('v:\\FITURDAY\\backend\\mapped_gifs.txt', out);
        console.log("Wrote mappings to mapped_gifs.txt");
    } catch(e) {
        console.error(e);
    }
}
run();
