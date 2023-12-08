import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

export default class Text {
  constructor(scene) {
    this.scene = scene;
    //this.loadFont();
    //on doit le faire après, ça telecharge des fichiers
  }

  loadFont() {
    const loader = new FontLoader();
    return new Promise((resolve, reject) => {
      loader.load("./Suisse Ecal Int'l Cond Bold_Regular.json", (font) => {
        this.font = font;
        resolve(this.font);
      });
    });
  }

  createText(_text, font, type, h, s, padding) {
    let fillMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    let outlineMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });

    const geometry = new TextGeometry(_text, {
      font: font,
      size: s,
      height: h,
      curveSegments: 12,
      bevelEnabled: true,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 20,
      material: 0,
      extrudeMaterial: 1,
    });

    let colorMaterial = 0xffffff;
    if (type == "user") {
      colorMaterial = 0xffffff;
    }

    // const material = new THREE.MeshToonMaterial({ color: colorMaterial });
    const materialTop = new THREE.MeshPhongMaterial({ color: colorMaterial });
    materialTop.castShadow = true;
    const materialSide = new THREE.MeshPhongMaterial({ color: 0x000000 });
    materialSide.castShadow = true;
    const materialArray = [materialTop, materialSide];
    // material.reflectivity = 1;
    // material.transmission = 1;
    // material.roughness = 0.2;
    // material.clearcoat = 0.3;
    // material.metalness = 0;
    // material.clearcoatRoughness = 0.25;
    // material.ior = 1.2;
    // material.thikness = 10;
    const text = new THREE.Mesh(geometry, materialArray);
    text.rotateX(-Math.PI / 2);
    text.castShadow = true;
    text.receiveShadow = true;

    // Calculer la boîte englobante
    const boiteEnglobante = new THREE.Box3().setFromObject(text);
    const tailleBoite = new THREE.Vector3();
    boiteEnglobante.getSize(tailleBoite);
    text.tailleBoite = tailleBoite;

    // Ajuster la position du mesh en fonction du centre de la boîte englobante
    //devant derrière
    text.position.x -= tailleBoite.x / 2;
    text.position.y -= tailleBoite.y / 2;
    text.position.z -= tailleBoite.z / 2;
    this.scene.add(text);

    return text;
  }
}
