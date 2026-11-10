// node tools/proj.mjs '{"pos":[..],"look":[..],"fov":50,"roll":0}' '{"name":[x,y,z],...}'  -> screen px (1080x1920, view offset 75,-175)
import * as THREE from '../web/lib/three.module.js';
const C = JSON.parse(process.argv[2]), pts = JSON.parse(process.argv[3]);
const cam = new THREE.PerspectiveCamera(C.fov, 1080 / 1920, 0.1, 3000); cam.position.set(...C.pos); cam.lookAt(...C.look); cam.rotateZ((C.roll || 0) * Math.PI / 180);
const off = C.off || [75, -175]; cam.setViewOffset(1080, 1920, off[0], off[1], 1080, 1920); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
for (const k in pts) { const v = new THREE.Vector3(...pts[k]).project(cam); console.log(k.padEnd(10), Math.round((v.x + 1) / 2 * 1080), Math.round((1 - v.y) / 2 * 1920), v.z < 1 ? '' : 'BEHIND'); }
