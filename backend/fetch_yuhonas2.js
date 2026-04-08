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
            
            // specific overrides for better matching
            if (target === "Squat") search = "barbell squat";
            if (target === "Deadlift") search = "barbell deadlift";
            if (target === "Overhead Press (OHP)") search = "seated barbell military press";
            if (target === "Lateral Raise") search = "dumbbell lateral raise";
            if (target === "Pec Deck Fly") search = "butterfly";
            if (target === "Pull-up") search = "pull-up";
            if (target === "Seated Dumbbell Shoulder Press") search = "dumbbell seated shoulder press";

            const found = exercises.find(e => e.name.toLowerCase() === search || e.name.toLowerCase().includes(search) || search.includes(e.name.toLowerCase()));
            
            if (found) {
                const url = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${found.images[0]}`;
                out += `${target}: ${url}\n`;
            } else {
                out += `${target}: MISSING\n`;
            }
        }
        console.log(out);
    } catch(e) {
        console.error(e);
    }
}
run();
