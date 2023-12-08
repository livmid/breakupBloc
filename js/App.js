import * as THREE from "three";
import Shape from "./shape";
import Light from "./Light.js";
import * as dat from "dat.gui";
import Text from "./Text.js";
import Chat from "./Chat.js";
import AudioDetector from "./AudioDetector";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { ImprovedNoise } from "https://unpkg.com/three/examples/jsm/math/ImprovedNoise.js";

export default class APP {
  constructor() {
    console.log("APP");
    // test Liv
    this.lineCounter = 0;
    this.charCounter = 0;
    this.gapX = 0;
    this.renderer = null;
    this.scene = null;
    this.lastType = "";
    this.totalHeight = 0;
    this.canSpeak = true;
    this.scaleLerpValue = 0.08;
    this.colorEnd = 0xff0000;
    this.byeByeArray = [];

    this.camera = null;
    // this.gui = new dat.GUI();

    this.chat = new Chat();

    //test text réponse user
    this.currentRole = "user";

    this.chat.addEventListener("word", this.addWord.bind(this, "assistant"));
    //à la fin qaund il à finit, enous envoie un event speech end lancer detection micro
    this.chat.addEventListener("speechEnd", this.speechEnd.bind(this));
    this.chat.addEventListener("gpt_response", this.onResponse.bind(this));

    this.chat.gui(this.gui);

    //init audio detectiur / je parle et j'envoie au service
    this.audioDetector = new AudioDetector();
    this.audioDetector.addEventListener(
      "transcriptReady",
      this.onTextReceived.bind(this)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        console.log("space");
        this.audioDetector.stopRecording();
        this.canSpeak = false;
      }
    });

    this.previousPosition = 0;

    this.initTHREE();
  }

  async initTHREE() {
    // create a threejs scene
    this.scene = new THREE.Scene();
    // create a camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.z = 10;
    this.camera.position.y = 10;
    this.camera.position.x = -3.5;
    this.camera._target = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 5));

    // const axis = new THREE.Vector3(0, 1, 0);
    // const rotationAngleY = Math.PI / 180;
    // this.camera.rotateOnAxis(axis, rotationAngleY);

    // create a renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Set shadow
    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    document.body.appendChild(this.renderer.domElement);

    // create controls
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //create a light
    this.light = new Light(this.scene);
    this.light.createLight();

    // Inside your constructor or wherever you initialize your light
    this.lightTargetPosition = new THREE.Vector3();

    // this.light.gui(this.gui);

    // floor
    this.shape = new Shape(this.scene);
    this.floor = this.shape.createFloor();
    this.floor._target = new THREE.Vector3(0, 0, 0);

    //shape.createCealing();

    // create text
    this.text = new Text(this.scene);

    this.font = await this.text.loadFont();
    //console.log("initTHREE");

    this.allMots = [];

    // //add STAAART button
    const startChatButton = document.createElement("button");
    const startGif = document.getElementById("startGif");
    startGif.style.backgroundColor = "transparent";

    document.body.appendChild(startChatButton);

    startGif.addEventListener("click", () => {
      this.chat.call(this.chat.context);
      startGif.remove();
      document.body.style.cursor = "none";
    });

    this.draw();
  }

  addWord(type, word) {
    console.log(type, word);

    this.charCounter += word.length;
    if (this.charCounter > 10) {
      this.gapX = 0;
      this.lineCounter++;
      this.charCounter = 0;
    }

    let h = 0.5;
    let s = 2;

    //taile user text
    // if (type == "user") {
    //   s = 0.5;
    // }

    const text = this.text.createText(word, this.font, type, h, s);
    text.position.y = -0.4;

    if (this.chat.messages.length == 1) {
      text.scale.z = 0.15;
      text._targetHeight = 0.09 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 3) {
      text.scale.z = 0.09;
      text._targetHeight = 0.19;
      // this.byeByeArray.push(text);
    } else if (this.chat.messages.length == 5) {
      text.scale.z = 0.19;
      text._targetHeight = 0.27 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 7) {
      text.scale.z = 0.25;
      text._targetHeight = 0.32 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 9) {
      text.scale.z = 0.33;
      text._targetHeight = 0.41 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 11) {
      text.scale.z = 0.41;
      text._targetHeight = 0.44 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 13) {
      text.scale.z = 0.44;
      text._targetHeight = 0.48 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 15) {
      text.scale.z = 0.5;
      text._targetHeight = 0.5 + Math.random() * 0.01;
    } else if (this.chat.messages.length == 17) {
      text.scale.z = 0.5;
      text._targetHeight = 0.5;
      this.byeByeArray.push(text);
    }

    this.allMots.push(text);

    const size = new THREE.Box3().setFromObject(text);
    text.position.x = this.gapX;
    // text.position.z = this.lineCounter * 5;

    const incrementX = size.max.x + 0.2;
    this.gapX += incrementX;
    let offset = 2;

    //réglages marge
    // if (type == "user") {
    //   offset = 5;
    // }

    text.position.z = this.totalHeight - (this.allMots.length - 1) * 1.5;
    this.totalHeight +=
      text.geometry.boundingBox.max.y -
      text.geometry.boundingBox.min.y +
      offset;

    // text.position.y += offsetFromLastWord;

    // this.allMots.forEach((mot, index) => {});
    this.lastWord = this.allMots[this.allMots.length - 1];
    this.lightTargetPosition.set(
      this.lastWord.position.x,
      0,
      this.lastWord.position.z
    );
    let positionCameraX = text.position.x;

    this.camera._target = new THREE.Vector3(
      positionCameraX,
      0,
      this.lastWord.position.z
    );

    // this.light.spotLight.position.x = this.camera.position.x;
    this.light.spotLight.position.z = this.camera.position.z;
    this.light.spotLight.position.x = this.camera.position.x;
    // this.light.spotLight.lookAt(lastWord);
    // this.light.spotLight.target = this.lastWord;
    // this.light.spotLight.target.updateMatrixWorld();

    this.floor._target = new THREE.Vector3(
      text.position.x,
      0,
      this.lastWord.position.z
    );

    this.lastType = type;
  }

  speechEnd(data) {
    //test text user
    console.log("SPEECHEND");
    const response = data.choices[0].message.content;

    this.chat.messages.push({
      role: "assistant",
      //content: data.choices[0].message.content,
      //test text user
      content: response,
    });
    this.audioDetector.startRecording();

    if (this.chat.messages.length == 18) {
      this.scaleLerpValue = 0.01;
      for (let i = 0; i < this.byeByeArray.length; i++) {
        console.log(this.byeByeArray[i]._targetHeight);
        this.byeByeArray[i]._targetHeight = -0.0002;
      }
    }
  }

  onResponse(response) {
    // console.log("on response", response);

    this.myInterval = setInterval(() => {
      if (this.canSpeak) {
        console.log("on response-", response);
        this.chat.launchSpeech(response);
        this.previousPosition = 0;
        clearInterval(this.myInterval);
      }
    }, 500);
  }

  lancerLesMotsAvecInterval() {
    if (this.myWords.length > 0) {
      const mot = this.myWords.shift();
      setTimeout(() => {
        const text = this.text.createText(mot, this.font, "user", 0.5, 0.5, 0);
        // console.log(text.tailleBoite.x);
        text.position.x = this.previousPosition;
        text.position.z = this.lastWord.position.z + 1;
        this.previousPosition += text.tailleBoite.x;
        this.camera._target = new THREE.Vector3(
          text.position.x - 4,
          0,
          text.position.z
        );
        this.lancerLesMotsAvecInterval();
      }, 200);
    } else {
      this.allMots = [];
      this.canSpeak = true;
    }
  }

  onTextReceived(transcript) {
    //test text user
    // this.chat.messages.push({
    //   role: "user",
    //   content: transcript.text,
    // });

    // this.addWord("user", transcript.text);
    //code base
    this.chat.call(transcript.text);

    this.myWords = transcript.text.split(" ");
    this.lancerLesMotsAvecInterval();
  }

  draw() {
    // console.log("draw");

    this.light.spotLight.target.position.x = this.lerp(
      this.light.spotLight.target.position.x,
      this.lightTargetPosition.x,
      0.05
    );
    this.light.spotLight.target.position.z = this.lerp(
      this.light.spotLight.target.position.z,
      this.lightTargetPosition.z,
      0.5
    );
    this.light.update();

    this.camera.position.x = this.lerp(
      this.camera.position.x,
      this.camera._target.x,
      0.05
    );
    this.camera.position.z = this.lerp(
      this.camera.position.z,
      this.camera._target.z,
      0.05
    );
    //light position
    this.light.spotLight.position.x = this.camera.position.x - 30;
    this.light.spotLight.position.z = this.camera.position.z + 50;
    this.light.spotLight.position.y = this.camera.position.y + 20;

    this.floor.position.x = this.lerp(
      this.floor.position.x,
      this.floor._target.x,
      0.06
    );
    this.floor.position.z = this.lerp(
      this.floor.position.z,
      this.floor._target.z,
      0.06
    );

    this.allMots.forEach((mot) => {
      if (mot._targetHeight) {
        // console.log(mot._targetHeight, this.camera.position.y);
        mot.scale.z = this.lerp(
          mot.scale.z,
          mot._targetHeight,
          this.scaleLerpValue
        );
        const scaleNormalized = (mot.scale.z - 0.09) / (0.5 - 0.09);
        const color = new THREE.Color().setRGB(
          scaleNormalized,
          1 - scaleNormalized,
          0
        );
        // const hue = 0.3 + Math.min((mot.scale.z - 1.01) / 0.4, 1) * 0.4;
        // const color = new THREE.Color().setHSL(hue, 1, 0.5);
        const color2 = new THREE.Color().setHSL(0, 0, 1);
        // mot.material[0].color.copy(color2);
        // mot.material[0].emissive.copy(color2);
        mot.material[1].color.copy(color);
        mot.material[1].emissive.copy(color);
      }
    });

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.draw.bind(this));
  }

  lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
  }
}
