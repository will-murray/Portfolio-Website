import  { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function ColorWave({ coloringFunctionManager, redraw, maxSeqLength }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const curveRef = useRef(null);

  const r = 0.01;

  const animate = () => {
    requestAnimationFrame(animate);
    controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

   function addAxis(scene){
      let xmat = new THREE.LineBasicMaterial( {color:"red"});
      let xpoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0)]
      let xgeo = new THREE.BufferGeometry().setFromPoints(xpoints);
      let xline = new THREE.Line(xgeo,xmat);

      let ymat = new THREE.LineBasicMaterial( {color:"blue"});
      let ypoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,1)]
      let ygeo = new THREE.BufferGeometry().setFromPoints(ypoints);
      let yline = new THREE.Line(ygeo,ymat);



      let zmat = new THREE.LineBasicMaterial( {color:"green"});
      let zpoints = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)]
      let zgeo = new THREE.BufferGeometry().setFromPoints(zpoints);
      let zline = new THREE.Line(zgeo,zmat);

      scene.current.add(xline);
      scene.current.add(yline);
      scene.current.add(zline);

  }


  const buildcurve = (r, num_seg) => {
    const group = new THREE.Group();
    const geo = new THREE.SphereGeometry(r, num_seg);
    const unboundedGeo = new THREE.BoxGeometry(2*r,2*r, 2*r)

    for (let i = 0; i < maxSeqLength; i += 1) {
      let g =null
      const [c1, c2, c3] = coloringFunctionManager.current.eval(i);
      if(c1 > 255 || c2 > 255 || c3 > 255){
        g = unboundedGeo
      }
      else{
        g = geo
      }
      const S = new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(`rgb(${c1},${c2},${c3})`),
          wireframe: false,
        })
      );
      

      S.position.set(c1 / 255, c2 / 255, c3 / 255);
      group.add(S);
    }
    return group;
  };

  // Initial setup
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 1;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current = camera;

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer();
      rendererRef.current.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
      mountRef.current.appendChild(rendererRef.current.domElement);
    }

    const renderer = rendererRef.current;
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    sceneRef.current = scene;
    addAxis(sceneRef)

    // Add initial curve
    const curve = buildcurve(r, 10);
    scene.add(curve);
    curveRef.current = curve;

    animate();

    return () => {
      // Cleanup on unmount
      if (curveRef.current) {
        scene.remove(curveRef.current);
        curveRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
      renderer.dispose();
      controls.dispose();
      if (
        renderer.domElement &&
        mountRef.current?.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Redraw effect
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old curve
    if (curveRef.current) {
      sceneRef.current.remove(curveRef.current);
      curveRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    // Add new curve
    const newCurve = buildcurve(r, 10);
    sceneRef.current.add(newCurve);
    curveRef.current = newCurve;
  }, [redraw, maxSeqLength]);

  return <div ref={mountRef} style={{ width: "600px", height: "400px" }} />;
}