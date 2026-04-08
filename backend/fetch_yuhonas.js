const fs = require('fs');

async function run() {
    try {
        console.log("Fetching exercises.json...");
        const res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
        const exercises = await res.json();
        
        console.log(`Loaded ${exercises.length} exercises.`);
        
        // Print 3 examples to understand the structure
        console.log(JSON.stringify(exercises.slice(0, 3), null, 2));

        // Let's create a map based on name
        const exercisesToFind = [
            "Barbell Bench Press",
            "Incline Dumbbell Press",
            "Squat",
            "Leg Press",
            "Deadlift",
            "Lat Pulldown",
            "Overhead Press",
            "Lateral Raise",
            "Barbell Curl",
            "Tricep Pushdown",
            "Bulgarian Split Squat",
            "Pec Deck Fly",
            "Seated Cable Row",
            "Plank",
            "Russian Twist",
            "Pull-up",
            "Leg Extension",
            "Seated Dumbbell Shoulder Press",
            "Hammer Curl",
            "Cable Crunches"
        ];
        
        console.log("Searching for our exercises...");
        for (const target of exercisesToFind) {
            // Very simple find by name containing
            const found = exercises.find(e => 
                e.name.toLowerCase().includes(target.toLowerCase().replace(' (ohp)', '').replace(' cable ', ' ').replace('s', '')) ||
                target.toLowerCase().includes(e.name.toLowerCase())
            );
            if (found) {
                console.log(`FOUND: [${target}] -> ID: ${found.id}, Name: ${found.name}`);
                // Assuming URL structure based on their standard format or if URL is inside
            } else {
                console.log(`MISSING: [${target}]`);
            }
        }
    } catch(e) {
        console.error(e);
    }
}
run();
