import * as THREE from "three";

export default class Shape {
  constructor(scene) {
    this.scene = scene;
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
    });
    // material.reflectivity = 0.2;
    // material.transmission = 0;
    // material.roughness = 0.2;
    // material.clearcoat = 0.3;
    // material.metalness = 1;
    //const plane = new THREE.Mesh(geometry, material);
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.position.set(5, 0, 0);

    this.plane.receiveShadow = true;
    this.plane.rotateX(Math.PI / 2);

    this.scene.add(this.plane);
    return this.plane;
  }
}
