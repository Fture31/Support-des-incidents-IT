// const express= require("express")
// const router = express.Router()
// const bcrypt = require('bcrypt');

// router.post('/chat', async (req, res) => {

// const axios = require('axios');

// // Request body
// const requestBody = {
//   prompt: req.body.prompt,
//   system_prompt: 'repondre en francais .'
// };

// // Axios request configuration
// const config = {
//   method: 'post',
//   url: 'https://llama-3.p.rapidapi.com/llama3',
//   headers: {
//     'x-rapidapi-key': '4cfbf58ef7mshd70c7eff75010f0p13e16ejsnf16d261b84d2',
//     'x-rapidapi-host': 'llama-3.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: requestBody
// };
// try {
//   const response = await axios(config);
//   res.json(response.data); // Envoyer la réponse complète au client
// } catch (error) {
//   console.error(error);
//   res.status(500).send("Erreur lors de l'appel à l'API.");
// }

// });
//  module.exports = router;
// const express= require("express")
// const router = express.Router()
// const bcrypt = require('bcrypt');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const session = require('express-session');




// // Remplacez votre clé API ici ou utilisez une variable d'environnement
// const genAI = new GoogleGenerativeAI('AIzaSyBrPEVBqJoVWzSi-3XBT8WV8WZRnYsyj1s');

// router.post('/chat', async (req, res) => {
//     const userPrompt = req.body.prompt;

//     try {
//         // Créer un modèle de chat avec l'API de Gemini
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
//         // Initialiser un chat
//         const chat = model.startChat({
//             history: [
//                 {
//                     role: "user",
//                     parts: [{ text: userPrompt }],
//                 }
//             ],
//             generationConfig: {
//                 maxOutputTokens: 1000,
//                 temperature: 0.8,
//             },
//         });

//         // Envoyer le message de l'utilisateur
//         const result = await chat.sendMessage(userPrompt);

//         // Récupérer la réponse du modèle
//         const response = await result.response;
//         const botText = response.text();

//         // Envoyer la réponse au client
//         res.json({ msg: botText });
//     } catch (error) {
//         console.error('Erreur lors de l\'appel à l\'API:', error);
//         res.status(500).send("Erreur lors de l'appel à l'API.");
//     }
// });

// module.exports = router;

const express= require("express")
const router = express.Router()
const bcrypt = require('bcrypt');
const session = require('express-session');

router.post('/chat', async (req, res) => {

const axios = require('axios');

// Request body
const requestBody = {
  prompt: req.body.prompt,
  system_prompt: 'repondre en francais .'
};

// Axios request configuration
const config = {
  method: 'post',
  url: 'https://llama-3.p.rapidapi.com/llama3',
  headers: {
    'x-rapidapi-key': '4cfbf58ef7mshd70c7eff75010f0p13e16ejsnf16d261b84d2',
    'x-rapidapi-host': 'llama-3.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: requestBody
};
try {
  const response = await axios(config);
  res.json(response.data); // Envoyer la réponse complète au client
} catch (error) {
  console.error(error);
  res.status(500).send("Erreur lors de l'appel à l'API.");
}

});

  module.exports = router;

