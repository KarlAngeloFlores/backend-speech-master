const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const { sendSuccess, throwError, sendError, getFriendlyErrorMessage } = require("../utils/util");
const { logSuccess, logError } = require("../utils/logs");
const traineeService = require("../services/trainee.service");

const OPENAI_KEY = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey: OPENAI_KEY });

const cheaper_model = 'gpt-3.5-turbo-0125';
const mid_model = 'gpt-4o-mini'
const voice_recognition_model = 'whisper-1';
const { Readable } = require("stream");

const traineeController = {
    generateScript: async (req, res) => {
        try {

            const { topic } = req.body;

            const inputConfig = [
                {
                    role: "system",
                    content: "You are an english trainer creating short reading script."
                },
                {
                    role: "user",
                    content: `Write a 1 paragraph very short script that the user can read about this topic ${topic}. Give only the script.`
                }
            ]

            const response = await client.responses.create({
                model: cheaper_model,
                input: inputConfig
            })

            const script = response.output[0].content[0].text;

            if(!script) {
                throwError("Generating script is not successful", 400, true)
            };
            
            logSuccess("Generated script successfully");
            sendSuccess(res, 200, { message: "Generated script successfully", script });

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
      }
}

module.exports = traineeController;