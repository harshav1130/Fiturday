const axios = require('axios');

async function testConcurrency() {
    console.log("Starting Concurrency Test...");

    try {
        // 1. Login as Gym Owner to create a slot
        console.log("Logging in as Gym Owner (owner@fiturday.com)...");
        const ownerLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'owner@fiturday.com',
            password: 'owner123'
        });
        const ownerToken = ownerLogin.data.accessToken;

        // Get Gym ID
        const gymsRes = await axios.get('http://localhost:5000/api/gyms', {
             headers: { Authorization: `Bearer ${ownerToken}` }
        });
        const gym = gymsRes.data[0];
        if (!gym) throw new Error("No gym found in database. Seed the database first.");

        // Create a slot with capacity: 1
        const today = new Date().toISOString().split('T')[0];
        console.log(`Creating a test slot for today (${today}) at gym ${gym.name} with capacity 1...`);
        const slotRes = await axios.post('http://localhost:5000/api/slots', {
            gymId: gym._id,
            date: today,
            startTime: '23:00',
            endTime: '23:59',
            capacity: 1
        }, {
            headers: { Authorization: `Bearer ${ownerToken}` }
        });
        const slotId = slotRes.data._id;
        console.log(`Test Slot Created! ID: ${slotId}`);

        // 2. Login as User to book the slot
        console.log("Logging in as User (user@fiturday.com)...");
        const userLogin = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user@fiturday.com',
            password: 'user123'
        });
        const userToken = userLogin.data.accessToken;

        // 3. Fire 5 simultaneous requests!
        console.log("\nFiring 5 simultaneous booking requests to grab the 1 available spot...");
        const reqs = [];
        for(let i=0; i < 5; i++) {
            reqs.push(
                axios.post('http://localhost:5000/api/bookings', { slotId, type: 'Gym' }, {
                    headers: { Authorization: `Bearer ${userToken}` }
                }).then(res => `SUCCESS: Created Booking ID ${res.data._id}`)
                  .catch(err => `FAILED: ${err.response?.status} - ${err.response?.data?.message || err.message}`)
            );
        }

        const results = await Promise.allSettled(reqs);
        console.log("\n--- Concurrency Results ---");
        results.forEach((res, idx) => console.log(`Request ${idx + 1}:`, res.value || res.reason));

        const successCount = results.filter(r => r.value && r.value.includes('SUCCESS')).length;
        const failCount = results.filter(r => r.value && r.value.includes('FAILED')).length;

        console.log('\n--- Summary ---');
        console.log(`Successful Bookings: ${successCount}`);
        console.log(`Failed Bookings: ${failCount}`);
        
        if (successCount === 1 && failCount === 4) {
            console.log("✅ CONCURRENCY TEST PASSED! The atomic lock prevented double booking.");
        } else {
            console.log("❌ CONCURRENCY TEST FAILED! Race conditions allowed multiple bookings.");
        }

    } catch (error) {
        console.error("Test execution error:", error.response?.data || error.message);
    }
}

testConcurrency();
