const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

async function clean() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // We know from previous diagnostics that:
        // trainer@fiturday.com is the CORRECT one (has trainer profile).
        // trainer_test@example.com is the DUPLICATE (empty).
        
        const duplicateEmail = 'trainer_test@example.com';
        const user = await User.findOne({ email: duplicateEmail });
        
        if (user) {
            console.log('Deleting duplicate account:', user.email, user._id);
            await User.deleteOne({ _id: user._id });
            console.log('Deleted successfully.');
        } else {
            console.log('Duplicate account already gone or not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
clean();
