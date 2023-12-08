import * as THREE from "three";
export default class Light {
  constructor(scene) {
    this.scene = scene;
  }
  createLight() {
    // ambient light (everywhere on scene)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // spot light
    this.spotLight = new THREE.SpotLight(0xffffff, 400);
    this.spotLight.penumbra = 0.5;
    this.spotLight.angle = Math.PI / 5;
    this.spotLight.decay = 1;
    this.spotLight.position.set(10, 30, 10);
    // generate shadow
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 4096;
    this.spotLight.shadow.mapSize.height = 4096;

    this.scene.add(this.spotLight);
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    // this.scene.add(this.spotLightHelper);

    // const hemisphereLight = new THREE.HemisphereLight(0xffffff, 1);
    // this.scene.add(hemisphereLight);
  }

  update() {
    this.spotLightHelper.update();
    // this.spotLight.position.x = Math.sin(Date.now() * 0.0005) * 5;
    // this.spotLight.position.z = Math.cos(Date.now() * 0.0005) * 5;
  }

  gui(gui) {
    const folder = gui.addFolder("Light");
    // folder.add(this.spotLight, "intensity", 0, 200, 0.01);

    // control the angle of the spot light
    // folder.add(this.spotLight, "angle", 0, Math.PI / 2, 0.01);

    //control of positions
    // folder.add(this.spotLight.position, "x", -10, 10, 0.01);
    // folder.add(this.spotLight.position, "y", -10, 10, 0.01);
    // folder.add(this.spotLight.position, "z", -10, 10, 0.01);
    // change color
    // folder.addColor(this.spotLight, "color");
    // control caustics of shadow
    // folder.add(this.spotLight, "penumbra", 0, 1, 0.01);
    // change distance
    // folder.add(this.spotLight, "distance", 0, 100, 0.01);

    folder.open();
  }
}
