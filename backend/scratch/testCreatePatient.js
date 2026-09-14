// import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust based on your server config

async function test() {
    try {
        // We'd need a token, but let's see if we can at least check the logic 
        // by calling the controller function directly in a script.
        const { createPatient } = await import('../controllers/staff/patientController.js');
        
        const req = {
            body: {
                name: "Test Patient",
                age: 30,
                gender: "Male",
                phoneNumber: "1234567890",
                address: "Test Address"
            }
        };
        
        const res = {
            status: function(s) { 
                this.statusCode = s; 
                return this; 
            },
            json: function(j) {
                console.log("Response:", JSON.stringify(j, null, 2));
                return this;
            }
        };
        
        const next = (err) => console.error("Error in next:", err);

        console.log("Calling createPatient controller...");
        await createPatient(req, res, next);
        
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
