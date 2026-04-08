export const workouts = [
    {
        id: 'w1',
        title: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
        instructions: [
            'Lie flat on the bench with your eyes under the bar.',
            'Grip the bar slightly wider than shoulder-width apart.',
            'Unrack the bar and slowly lower it to your mid-chest.',
            'Push the bar back up explosively until your arms are fully extended.',
            'Keep your feet flat on the floor and your glutes on the bench.'
        ],
        commonMistakes: [
            'Bouncing the bar off the chest.',
            'Flaring elbows out too much (puts stress on shoulders).'
        ]
    },
    {
        id: 'w2',
        title: 'Dumbbell Incline Press',
        targetMuscle: 'Upper Chest',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif',
        instructions: [
            'Set an incline bench to a 30-45 degree angle.',
            'Sit with dumbbells resting on your thighs, then kick them up to your shoulders.',
            'Press the dumbbells straight up above your chest.',
            'Slowly lower them until you feel a stretch in your chest.'
        ],
        commonMistakes: [
            'Arching the lower back excessively.',
            'Not going down deep enough for a full stretch.'
        ]
    },
    {
        id: 'w3',
        title: 'Squat',
        targetMuscle: 'Quadriceps',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
        instructions: [
            'Place the barbell securely on your upper back/traps.',
            'Stand with feet shoulder-width apart, toes slightly pointed outward.',
            'Break at the hips and knees simultaneously to sit back.',
            'Descend until your thighs are at least parallel to the floor.',
            'Drive through your heels to return to the starting position.'
        ],
        commonMistakes: [
            'Knees caving inwards during the ascent.',
            'Rounding the lower back (butt wink) at the bottom.'
        ]
    },
    {
        id: 'w4',
        title: 'Leg Press',
        targetMuscle: 'Quadriceps',
        equipment: 'Machine',
        difficulty: 'Beginner',
        animationUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
        instructions: [
            'Sit in the machine and place your feet shoulder-width apart on the sled.',
            'Unrack the safety and slowly lower the weight until your knees are at a 90-degree angle.',
            'Press the weight back up without fully locking out your knees at the top.'
        ],
        commonMistakes: [
            'Locking the knees completely at the top (highly dangerous).',
            'Letting the lower back lift off the pad at the bottom.'
        ]
    },
    {
        id: 'w5',
        title: 'Conventional Deadlift',
        targetMuscle: 'Hamstrings & Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
        instructions: [
            'Stand with mid-foot under the barbell.',
            'Bend over and grip the bar shoulder-width apart.',
            'Bend your knees until your shins touch the bar.',
            'Lift your chest to straighten your back.',
            'Pull the weight off the floor, keeping the bar close to your body.',
            'Lock out at the top by squeezing your glutes.'
        ],
        commonMistakes: [
            'Rounding the lower back like a cat.',
            'Pulling with the arms rather than driving with the legs.'
        ]
    },
    {
        id: 'w6',
        title: 'Lat Pulldown',
        targetMuscle: 'Lats (Back)',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
        instructions: [
            'Sit down at the machine and adjust the knee pad.',
            'Grip the bar slightly wider than shoulder-width.',
            'Pull the bar down towards your upper chest, squeezing your shoulder blades together.',
            'Slowly release the bar back to the starting position.'
        ],
        commonMistakes: [
            'Leaning too far back and using momentum.',
            'Pulling the bar behind the neck (can cause injury).'
        ]
    },
    {
        id: 'w7',
        title: 'Overhead Press (OHP)',
        targetMuscle: 'Shoulders',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        animationUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Barbell_Military_Press/0.jpg',
        instructions: [
            'Stand with the bar resting on your front deltoids (shoulders).',
            'Grip the bar just wider than shoulder-width.',
            'Brace your core and press the bar straight overhead.',
            'Lock out your elbows and push your head slightly forward at the top.',
            'Lower the bar back to your shoulders.'
        ],
        commonMistakes: [
            'Leaning backward to turn it into an incline press.',
            'Not bracing the core, leading to lower back pain.'
        ]
    },
    {
        id: 'w8',
        title: 'Dumbbell Lateral Raise',
        targetMuscle: 'Side Deltoids',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
        instructions: [
            'Stand upright holding two dumbbells at your sides.',
            'Keep a slight bend in your elbows.',
            'Raise your arms straight out to the sides until they are parallel to the floor.',
            'Slowly lower the dumbbells back down.'
        ],
        commonMistakes: [
            'Using momentum by swinging the body.',
            'Raising the dumbbells higher than shoulder level.'
        ]
    },
    {
        id: 'w9',
        title: 'Barbell Bicep Curl',
        targetMuscle: 'Biceps',
        equipment: 'Barbell',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
        instructions: [
            'Stand holding a barbell with an underhand grip, shoulder-width apart.',
            'Keep your elbows pinned to your sides.',
            'Curl the bar up towards your chest, squeezing the biceps.',
            'Slowly lower the bar back to the starting position.'
        ],
        commonMistakes: [
            'Using the lower back to swing the weight up.',
            'Moving the elbows forward during the curl.'
        ]
    },
    {
        id: 'w10',
        title: 'Tricep Rope Pushdown',
        targetMuscle: 'Triceps',
        equipment: 'Cable Machine',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif',
        instructions: [
            'Attach a rope handle to a high cable pulley.',
            'Grip the rope and keep your elbows tucked into your sides.',
            'Push the rope down until your arms are fully extended, spreading the rope at the bottom.',
            'Slowly bring the rope back up until forearms are parallel to the floor.'
        ],
        commonMistakes: [
            'Letting the elbows flare out or move up and down.',
            'Standing too far away from the cable.'
        ]
    },
    {
        id: 'w11',
        title: 'Bulgarian Split Squat',
        targetMuscle: 'Quadriceps & Glutes',
        equipment: 'Dumbbells & Bench',
        difficulty: 'Advanced',
        animationUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
        instructions: [
            'Stand a few feet in front of a bench, holding dumbbells.',
            'Place one foot behind you on the bench.',
            'Lower your body until your front thigh is parallel to the floor.',
            'Push through the front heel to return to standing.'
        ],
        commonMistakes: [
            'Standing too close or too far from the bench.',
            'Letting the front knee track way past the toes.'
        ]
    },
    {
        id: 'w12',
        title: 'Pec Deck Fly',
        targetMuscle: 'Chest',
        equipment: 'Machine',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif',
        instructions: [
            'Sit on the machine with your back flat against the pad.',
            'Place your forearms on the pads or grip the handles.',
            'Squeeze your arms together in front of your chest.',
            'Slowly return to the starting position, maintaining tension.'
        ],
        commonMistakes: [
            'Going back too far and overstretching the shoulders.',
            'Using momentum instead of a controlled squeeze.'
        ]
    },
    {
        id: 'w13',
        title: 'Seated Cable Row',
        targetMuscle: 'Mid Back',
        equipment: 'Cable Machine',
        difficulty: 'Intermediate',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
        instructions: [
            'Sit at the machine with your feet on the platforms, knees slightly bent.',
            'Grip the V-handle attachment.',
            'Keep your back straight and pull the handle to your abdomen.',
            'Squeeze your shoulder blades together at the peak of the movement.',
            'Slowly extend your arms back out.'
        ],
        commonMistakes: [
            'Rounding the lower back.',
            'Pulling with the biceps instead of the back muscles.'
        ]
    },
    {
        id: 'w14',
        title: 'Plank',
        targetMuscle: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        animationUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
        instructions: [
            'Start in a push-up position, but rest on your forearms instead of your hands.',
            'Keep your body in a straight line from your head to your heels.',
            'Brace your core and squeeze your glutes.',
            'Hold this position for the desired time (e.g., 60 seconds).'
        ],
        commonMistakes: [
            'Letting the hips sag towards the floor.',
            'Raising the buttocks too high in the air.'
        ]
    },
    {
        id: 'w15',
        title: 'Russian Twists',
        targetMuscle: 'Obliques (Core)',
        equipment: 'Medicine Ball / Plate',
        difficulty: 'Intermediate',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif',
        instructions: [
            'Sit on the floor with your knees bent and feet elevated slightly.',
            'Lean back to a 45-degree angle, keeping your back straight.',
            'Hold a medicine ball or weight plate with both hands.',
            'Twist your torso to the right, touching the weight to the floor.',
            'Twist over to the left side and repeat.'
        ],
        commonMistakes: [
            'Rounding the back instead of maintaining a straight spine.',
            'Only moving the arms without actually twisting the torso.'
        ]
    },
    {
        id: 'w16',
        title: 'Pull-up',
        targetMuscle: 'Lats (Back)',
        equipment: 'Pull-up Bar',
        difficulty: 'Intermediate',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
        instructions: [
            'Grab the pull-up bar with your palms facing outward, slightly wider than shoulder-width.',
            'Hang freely, keeping your core tight and shoulders pulled back.',
            'Pull yourself up until your chin is above the bar.',
            'Slowly lower yourself back down to a full dead hang.'
        ],
        commonMistakes: [
            'Using momentum by kicking the legs (kipping).',
            'Not doing a full range of motion (half-reps).'
        ]
    },
    {
        id: 'w17',
        title: 'Leg Extension',
        targetMuscle: 'Quadriceps',
        equipment: 'Machine',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
        instructions: [
            'Adjust the machine so the pad rests comfortably on your lower shins.',
            'Sit with your back straight against the backrest.',
            'Extend your legs fully until your knees are straight.',
            'Squeeze your quads at the top, then slowly lower the weight.'
        ],
        commonMistakes: [
            'Lifting the hips off the seat.',
            'Dropping the weight too quickly without control.'
        ]
    },
    {
        id: 'w18',
        title: 'Seated Dumbbell Shoulder Press',
        targetMuscle: 'Shoulders',
        equipment: 'Dumbbells',
        difficulty: 'Intermediate',
        animationUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
        instructions: [
            'Sit on a bench with back support, holding a dumbbell in each hand.',
            'Raise the dumbbells to shoulder height with palms facing forward.',
            'Press the weights straight up until your arms are fully extended.',
            'Slowly lower them back to shoulder level.'
        ],
        commonMistakes: [
            'Arching the lower back excessively to push the weight.',
            'Not bringing the dumbbells down far enough.'
        ]
    },
    {
        id: 'w19',
        title: 'Hammer Curls',
        targetMuscle: 'Biceps & Brachialis',
        equipment: 'Dumbbells',
        difficulty: 'Beginner',
        animationUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
        instructions: [
            'Stand upright holding two dumbbells by your sides, palms facing your body (neutral grip).',
            'Keep your elbows tucked into your sides.',
            'Curl the dumbbells up toward your shoulders while maintaining the neutral grip.',
            'Squeeze at the top, then slowly lower the weights down.'
        ],
        commonMistakes: [
            'Swinging the body to lift the weight.',
            'Letting the elbows drift forward.'
        ]
    },
    {
        id: 'w20',
        title: 'Cable Crunches',
        targetMuscle: 'Core',
        equipment: 'Cable Machine',
        difficulty: 'Intermediate',
        animationUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg',
        instructions: [
            'Attach a rope handle to a high cable pulley.',
            'Kneel down a few feet away from the machine, holding the rope beside your head.',
            'Crunch your torso downward, bringing your elbows toward your knees.',
            'Squeeze your abs at the bottom, then slowly uncurl your torso.'
        ],
        commonMistakes: [
            'Pulling with the arms instead of contracting the abs.',
            'Keeping the back completely straight (you need to round it to flex the spine).'
        ]
    }
];
