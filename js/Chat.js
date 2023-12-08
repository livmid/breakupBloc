import Config from "./Config.js";
import Speech from "speak-tts";
import EventEmitter from "@onemorestudio/eventemitterjs";
export default class Chat extends EventEmitter {
  constructor() {
    super();
    this.API_URL = "https://api.openai.com/v1/chat/completions";
    this.API_KEY = Config.OPEN_AI_KEY;
    this.messages = [];
    this.context =
      // "PROMP HERE";
      // "Tu es un spécialiste de l'ECAL, Ecole Cantonale d'Art de Lausanne. Et tu me poses des questions. Basé sur mes réponses, tu me poses d'autres questions. Tu fais des question réponses très courtes et succinctes. Commence par me poser une question sur un quelconque sujet en relation avec l'ECAL.";
      // "exprime toi uniquement en 'miaou' pas plus de 5x";
      //"We are in a romantic relationship. You're a very jealous, resentful person and you ask me a question. Whenever I answer, you reply with another question. Your answers are short and it escalates more and more, despite the fact that I am being calm. Try to make an effort in this role play, even if jealousy and resentment are not in your nature, think of things, that jealous and resentful people would say. You start by asking a general question like: Would you still love me if I was a worm?.";
      "We are in a romantic relationship. You're a very jealous, resentful and manipulative person and you ask me a question. Whenever I answer, you reply with another question, because you don't believe my statements and you think that everything is my fault. Your answers are short. In your answers you use words like: liar, everything, always, egoist, principle, no, selfish, not. Our dialog escalates more and more, despite the fact that I am staying calm. Try to make an effort in this role play, even if jealousy and resentment are not in your nature, think of things, that jealous and resentful people would say. You start by asking a general question, that involves me and you that is not too offensive to start. DON'T say Why were you talking to that person at the party? or anything linked to a party. First question you ask is Where have you been?";
    this.speech = new Speech(); // will throw an exception if not browser supported
    if (this.speech.hasBrowserSupport()) {
      // returns a boolean
      console.log("speech synthesis supported");
    }
    this.speech
      .init({
        volume: 1,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        voice: "Reed",
        splitSentences: true,
        listeners: {
          onvoiceschanged: (voices) => {
            console.log("Event voiceschanged", voices);
          },
        },
      })
      .then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        console.log("Speech is ready, voices are available", data);
        // this.speech.voice = "Eddy (anglais (États-Unis))";
      })
      .then(() => {
        console.log("Success !");
        //
        // this.call(this.context);
      })
      .catch((e) => {
        console.error("An error occured while initializing : ", e);
      });
    // console.log(this.speech);
    // this.init();
  }
  async init() {
    // on invente un contexte pour le chat
  }

  async call(userMessage) {
    this.messages.push({
      role: "user",
      content: userMessage,
    });
    console.log("config", Config.TEXT_MODEL);
    console.log("userMessage", userMessage);
    try {
      console.log("Send message to OpenAI API");
      // Fetch the response from the OpenAI API with the signal from AbortController
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: Config.TEXT_MODEL, // "gpt-3.5-turbo",
          messages: this.messages,
        }),
      });

      this.data = await response.json();

      this.speech.rate = 0.55;
      this.speech.pitch = 1.5;

      if (this.messages.length == 3) {
        this.speech.rate = 0.8;
        this.speech.pitch = 1.55;
      } else if (this.messages.length == 5) {
        this.speech.rate = 0.9;
        this.speech.pitch = 1.6;
      } else if (this.messages.length == 7) {
        this.speech.rate = 1;
        this.speech.pitch = 1.8;
      } else if (this.messages.length == 9) {
        this.speech.rate = 1.2;
        this.speech.pitch = 2;
      } else if (this.messages.length == 11) {
        this.speech.rate = 1.1;
        this.speech.pitch = 1.95;
      } else if (this.messages.length == 13) {
        this.speech.rate = 1.1;
        this.speech.pitch = 1.8;
      } else if (this.messages.length == 15) {
        this.speech.rate = 1.05;
        this.speech.pitch = 1.9;
      } else if (this.messages.length == 17) {
        this.speech.rate = 1.1;
        this.speech.pitch = 2.1;
      }

      // ici on attends la réponse de CHAT GPT
      console.log(this.data.choices[0].message.content);

      // on peut envoyer la réponse à l'app dans l'idée de voir si on pourrait générer une image
      this.emit("gpt_response", [this.data.choices[0].message.content]);
      this.activeString = "";
      //on peut faire parler le bot
      // this.speech
      //   .speak({
      //     text: data.choices[0].message.content,
      //     listeners: {
      //       onstart: () => {
      //         // console.log("Start utterance");
      //       },
      //       onend: () => {
      //         // console.log("End utterance");
      //       },
      //       onresume: () => {
      //         // console.log("Resume utterance");
      //       },
      //       onboundary: (event) => {
      //         this.extractWord(event);
      //       },
      //     },
      //   })
      //   .then(() => {
      //     // console.log("This is the end my friend!");
      //     this.emit("speechEnd", [data]);
      //   });
    } catch (error) {
      console.error("Error:", error);
      resultText.innerText = "Error occurred while generating.";
    }
  }

  launchSpeech(text) {
    //on peut faire parler le bot
    this.speech
      .speak({
        text: text,
        listeners: {
          onstart: () => {
            // console.log("Start utterance");
          },
          onend: () => {
            // console.log("End utterance");
          },
          onresume: () => {
            // console.log("Resume utterance");
          },
          onboundary: (event) => {
            this.extractWord(event);
          },
        },
      })
      .then(() => {
        // console.log("This is the end my friend!");
        this.emit("speechEnd", [this.data]);
      });
  }

  extractWord(event) {
    const index = event.charIndex;
    console.log(event.charIndex);

    const word = this.getWordAt(event.target.text, index);

    this.emit("word", [word]);
  }

  // Get the word of a string given the string and index
  getWordAt(str, pos) {
    // Perform type conversions.
    str = String(str);
    pos = Number(pos) >>> 0;

    // Search for the word's beginning and end.
    let left = str.slice(0, pos + 1).search(/\S+$/);
    let right = str.slice(pos).search(/\s/);

    // The last word in the string is a special case.
    let wordReturn = str.slice(left, right + pos);
    console.log("left", wordReturn);

    if (right < 0) {
      wordReturn = str.slice(left);
      console.log("right", wordReturn);
    }

    // Return the word, using the located bounds to extract it from the string.
    return wordReturn;
  }

  gui(gui) {
    // setTimeout(() => {
    //   const folder = gui.addFolder("Voice");
    //   folder.add(this.speech, "rate", 0.1, 2, 0.01);
    //   folder.add(this.speech, "pitch", 0.1, 2, 0.01);
    // }, 2000);
  }
}
