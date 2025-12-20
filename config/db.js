require("dotenv").config();

const mongoose = require("mongoose");

const connectionString = process.env.MONGO_URL;

mongoose.connect(connectionString).then(res => {
    console.log("MongoDB connection successful");

}).catch((err)=>{
    console.log(err)

})