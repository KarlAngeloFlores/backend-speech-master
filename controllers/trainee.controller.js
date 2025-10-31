const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const {
  sendSuccess,
  throwError,
  sendError,
  getFriendlyErrorMessage,
} = require("../utils/util");
const { logSuccess, logError } = require("../utils/logs");
const traineeService = require("../services/trainee.service");

const OPENAI_KEY = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey: OPENAI_KEY });

const cheaper_model = "gpt-3.5-turbo-0125";
const mid_model = "gpt-4o-mini";
const voice_recognition_model = "whisper-1";
const { Readable } = require("stream");

const traineeController = {
  generateScript: async (req, res) => {
    try {
      const { topic } = req.body;

      const inputConfig = [
        {
          role: "system",
          content: "You are an english trainer creating short reading script.",
        },
        {
          role: "user",
          content: `Write a 1 paragraph very short script that the user can read about this topic ${topic}. Give only the script.`,
        },
      ];

      const response = await client.responses.create({
        model: cheaper_model,
        input: inputConfig,
      });

      const script = response.output[0].content[0].text;

      if (!script) {
        throwError("Generating script is not successful", 400, true);
      }

      logSuccess("Generated script successfully");
      sendSuccess(res, 200, {
        message: "Generated script successfully",
        script,
      });
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  // analyzeVoice: async (req, res) => {
  //     try {
  //       const { script } = req.body;
  //       const filePath = req.file.path;
  //       const newFilePath = filePath + ".webm";

  //       //rename file
  //       fs.renameSync(filePath, newFilePath);

  //       //get audio transcription from whisper api
  //       const transcription = await client.audio.transcriptions.create({
  //         file: fs.createReadStream(newFilePath),
  //         model: voice_recognition_model,
  //       });

  //       const userSpeech = transcription.text; //result of transcription to be processed on analyze prompt
  //       const analyzePrompt = [
  //         {
  //           role: "system",
  //           content:
  //             "You are a strict pronunciation evaluator. Always respond in valid JSON format with two keys: 'score' (0-100 integer) and 'feedback' (string).",
  //         },
  //         {
  //           role: "user",
  //           content: `Reference Script: "${script}"\nUser Transcription: "${userSpeech}"\n\nCompare the two and return JSON only. Example:\n{"score": 85, "feedback": "Good fluency. Mispronounced 'analysis'."}`,
  //         },
  //       ];

  //       const analyzeResponse = await client.responses.create({
  //         model: mid_model,
  //         input: analyzePrompt,
  //         temperature: 0.3, // keeps output more structured
  //       });
  //       //get the response of api analyzation

  //       //extract text from analyzation result
  //       const analyzationResult = analyzeResponse.output_text;

  //       //get the JSON on received prompt
  //       let parsedResult;
  //       try {
  //         parsedResult = JSON.parse(analyzationResult); //if not parsed, it will return failed to parse on catch
  //       } catch (e) {
  //         parsedResult = {
  //           score: 0,
  //           feedback: "Failed AI Analyzation.Please Try again",
  //         };
  //       }

  //       fs.unlinkSync(newFilePath);

  //       sendSuccess(res, 200, {
  //         message: "Analysis completed successfully",
  //         result: parsedResult
  //     })
  //     } catch (error) {
  //         logError(error.message);
  //         sendError(res, 500, getFriendlyErrorMessage(error));
  //     }
  //   },

  analyzeVoice: async (req, res) => {
    try {
      const { script } = req.body;

      console.log("File received:", req.file.originalname, req.file.mimetype);

      if (!req.file) {
        return sendError(res, 400, "No audio file uploaded");
      }

      // Convert buffer to stream for Whisper
      const audioStream = Readable.from(req.file.buffer);

      // Transcribe using Whisper API
      const transcription = await client.audio.transcriptions.create({
        file: new File(
          [req.file.buffer],
          req.file.originalname || "audio.webm",
          { type: req.file.mimetype || "audio/webm" }
        ),
        model: voice_recognition_model,
      });

      const userSpeech = transcription.text;

      // Analyze pronunciation with your eval prompt
      const analyzePrompt = [
        {
          role: "system",
          content:
            "You are a strict pronunciation evaluator. Always respond in valid JSON format with two keys: 'score' (0-100 integer) and 'feedback' (string).",
        },
        {
          role: "user",
          content: `Reference Script: "${script}"\nUser Transcription: "${userSpeech}"\n\nCompare the two and return JSON only. Example:\n{"score": 85, "feedback": "Good fluency. Mispronounced 'analysis'."}`,
        },
      ];

      const analyzeResponse = await client.responses.create({
        model: mid_model,
        input: analyzePrompt,
        temperature: 0.3,
      });

      let parsedResult;
      try {
        parsedResult = JSON.parse(analyzeResponse.output_text);
      } catch (e) {
        parsedResult = {
          score: 0,
          feedback: "Failed AI Analyzation. Please try again.",
        };
      }

      sendSuccess(res, 200, {
        message: "Analysis completed successfully",
        result: parsedResult,
      });
    } catch (error) {
      logError(error.message);
      sendError(res, 500, getFriendlyErrorMessage(error));
    }
  },

  // scenarioFeedback: async (req, res) => {
  //   try {
  //     const { scenario, question, userResponse } = req.body;

  //     //needs
  //     //ai answer to the question based on the scenario
  //     //ai feedback provide possible corrections and improvements
  //     const aiAnswerPrompt = [
  //       {
  //         role: "system",
  //         content: `You are a helpful assistant providing answer based on the scenario and answer of the previous user: ${userResponse}`,
  //       },
  //     ];

  //     const aiRecommendations = [
  //       {
  //         role: "system",
  //         content: `You are a helpful assistant. Provide a detailed answer to the question based on the scenario and question: ${scenario}.`
  //       },
  //       {
  //         role: "user",
  //         content: `Question: ${question}\nUser Response: ${userResponse}`
  //       }
  //     ];

  //     const aiResponse = await client.responses.create({
  //       model: mid_model,
  //       input: [userResponse],
  //     });

  //     sendSuccess(res, 200, {
  //       message: "Feedback generated successfully",
  //       feedback,
  //     });
  //   } catch (error) {
  //     logError(error.message);
  //     sendError(res, 500, getFriendlyErrorMessage(error));
  //   }
  // },

//   scenarioFeedback: async (req, res) => {
//   try {
//     const { scenario, question } = req.body;

//     if (!req.file) {
//       return sendError(res, 400, "No audio file uploaded");
//     }

//     console.log("File received:", req.file.originalname, req.file.mimetype);

//     // Step 1: Transcribe user's audio
//     const transcription = await client.audio.transcriptions.create({
//       file: new File(
//         [req.file.buffer],
//         req.file.originalname || "audio.webm",
//         { type: req.file.mimetype || "audio/webm" }
//       ),
//       model: voice_recognition_model,
//     });

//     const userSpeech = transcription.text;
//     console.log("User Transcription:", userSpeech);

//     // Step 2: Generate AI's reply (next line in conversation)
// const aiReplyPrompt = [
//   {
//     role: "system",
//     content: `
//       You are role-playing an AI assistant within the following scenario.
//       - Respond naturally according to the conversation flow.
//       - Use the previous question and user's reply for context.
//       - Keep replies short, friendly, and realistic.
//       - Avoid asking new questions unless it's part of the scenario (like Coffee Shop).
//     `,
//   },
//   {
//     role: "user",
//     content: `
//       Scenario: ${scenario}
//       Previous Question: "${question}"
//       User's Reply: "${userSpeech}"
//     `,
//   },
// ];


//     const aiReplyResponse = await client.responses.create({
//       model: mid_model,
//       input: aiReplyPrompt,
//       temperature: 0.6,
//     });

//     const ai_reply = aiReplyResponse.output_text.trim();

//     // Step 3: Generate AI's feedback on pronunciation and sentence quality
//     const feedbackPrompt = [
//       {
//         role: "system",
//         content: `
//           You are an English pronunciation and grammar coach.
//           Provide short feedback and possible corrections for improvement.
//         `,
//       },
//       {
//         role: "user",
//         content: `
//           Scenario: ${scenario}
//           Question: ${question}
//           User Response: "${userSpeech}"
//         `,
//       },
//     ];

//     const feedbackResponse = await client.responses.create({
//       model: mid_model,
//       input: feedbackPrompt,
//       temperature: 0.3,
//     });

//     const feedback = feedbackResponse.output_text.trim();

//     // Step 4: Return separate variables
//     sendSuccess(res, 200, {
//       message: "Scenario feedback generated successfully",
//       ai_reply,
//       feedback,
//       transcription: userSpeech,
//     });
//   } catch (error) {
//     logError(error.message);
//     sendError(res, 500, getFriendlyErrorMessage(error));
//   }
// },

scenarioFeedback: async (req, res) => {
  try {
    const { scenario, question } = req.body;

    if (!req.file) {
      return sendError(res, 400, "No audio file uploaded");
    }

    console.log("File received:", req.file.originalname, req.file.mimetype);

    // Step 1: Transcribe user's audio using Whisper
    const transcription = await client.audio.transcriptions.create({
      file: new File(
        [req.file.buffer],
        req.file.originalname || "audio.webm",
        { type: req.file.mimetype || "audio/webm" }
      ),
      model: voice_recognition_model,
    });

    const userSpeech = transcription.text.trim();
    console.log("User Transcription:", userSpeech);

    // Step 2: Generate AI's reply (continue the conversation naturally)
    const aiReplyPrompt = [
      {
        role: "system",
        content: `
          You are role-playing an AI assistant in the scenario below.
          - Continue the conversation naturally and contextually.
          - Use the previous question and the user’s reply for context.
          - Respond in a short, natural, and conversational tone (1–2 sentences max).
          - Do NOT repeat the question.
          - Do NOT ask new questions unless the scenario demands it (e.g., Coffee Shop order flow).
        `,
      },
      {
        role: "user",
        content: `
          Scenario: ${scenario}
          Previous Question: "${question}"
          User's Reply: "${userSpeech}"
        `,
      },
    ];

    const aiReplyResponse = await client.responses.create({
      model: mid_model,
      input: aiReplyPrompt,
      temperature: 0.6,
    });

    const ai_reply = aiReplyResponse.output_text.trim();

    // Step 3: Generate feedback (pronunciation + grammar)
    const feedbackPrompt = [
      {
        role: "system",
        content: `
          You are an English pronunciation and grammar coach.
          Give a short evaluation (2–3 sentences) and possible corrections for improvement.
          Avoid JSON or scores — only natural sentences.
        `,
      },
      {
        role: "user",
        content: `
          Scenario: ${scenario}
          Question: "${question}"
          User Response: "${userSpeech}"
        `,
      },
    ];

    const feedbackResponse = await client.responses.create({
      model: mid_model,
      input: feedbackPrompt,
      temperature: 0.3,
    });

    const feedback = feedbackResponse.output_text.trim();

    // Step 4: Return the data
    sendSuccess(res, 200, {
      message: "Scenario feedback generated successfully",
      ai_reply,
      feedback,
      transcription: userSpeech,
    });
  } catch (error) {
    logError(error.message);
    sendError(res, 500, getFriendlyErrorMessage(error));
  }
},


  getHome: async (req, res) => {
    try {
      const result = await traineeService.getHome(req.user.id);
      logSuccess("Fetched trainee home successfully");
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  dictionaryProxy: async (req, res) => {
    try {
      const result = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${req.params.word}`
      );
      const data = await result.json();
      logSuccess("Fetched dictionary data successfully");
      sendSuccess(res, 200, data);
    } catch (error) {
      logError(error);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  alternativeDictionary: async (req, res) => {
    try {
      const word = req.params.word;
      const prompt = [
        {
          role: "system",
          content:
            "You are a helpful English dictionary. Define the word in simple English. Respond with a JSON object: { 'word': string, 'definition': string }",
        },
        {
          role: "user",
          content: `Define the word: ${word}`,
        },
      ];

      const response = await client.responses.create({
        model: cheaper_model,
        input: prompt,
        temperature: 0.2,
      });

      let definition = null;
      try {
        definition = JSON.parse(response.output_text);
      } catch (e) {
        definition = {
          word,
          definition: response.output_text,
        };
      }

      logSuccess("Fetched OpenAI dictionary definition successfully");
      sendSuccess(res, 200, definition);
    } catch (error) {
      logError(error);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  getTrainers: async (req, res) => {
    try {
      const result = await traineeService.getTrainers();
      logSuccess("Fetched trainers successfully");
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  }
};

module.exports = traineeController;
