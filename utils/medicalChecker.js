const Groq = require('groq-sdk')

 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT
 

const checkMedicalContent = async (content) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content }
    ]
  });

  return response.choices[0].message.content.trim().toLowerCase();
};

module.exports = checkMedicalContent;
