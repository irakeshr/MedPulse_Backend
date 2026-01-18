const DoctorSchema = require("../models/DoctorProfile")

const getAllDoctors=async(req,res)=>{
try {
    const doctors = await DoctorSchema.find().populate("user","email");
     

    if(!doctors || doctors.length === 0){return res.status(404).json({success:false,message:"No doctors found."})}

    return res.status(200).json({success:true,message:"All Doctor Profiles fetched successfully.", doctors})
        
} catch (error) {
    return res.status(500).json({success:false,message:"Server Error!!",error: error.message})
    
}
}
  module.exports={getAllDoctors}