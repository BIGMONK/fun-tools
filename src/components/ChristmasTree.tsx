import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Upload, Camera, Trash2, Maximize, RotateCcw, Target } from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// --- 常量与色彩 ---
const PARTICLE_COUNT = 1500;
const TREE_COLORS = [0x22c55e, 0xfbbf24, 0xef4444, 0xffffff, 0x3b82f6];

export default function ChristmasTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 状态管理
  const [state, setState] = useState<'idle' | 'focus' | 'explode' | 'vortex'>('idle');
  const [photos, setPhotos] = useState<{ id: string, texture: THREE.Texture, pos: THREE.Vector3 }[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Three.js 核心对象引用
  const refs = useRef<{
    scene: THREE.Scene | null,
    renderer: THREE.WebGLRenderer | null,
    camera: THREE.PerspectiveCamera | null,
    controls: OrbitControls | null,
    particles: any[],
    instancedMesh: THREE.InstancedMesh | null,
    ornamentGroup: THREE.Group | null,
    handLandmarker: HandLandmarker | null,
    handPos: { x: number, y: number }
  }>({
    scene: null, renderer: null, camera: null, controls: null,
    particles: [], instancedMesh: null, ornamentGroup: null,
    handLandmarker: null, handPos: { x: 0.5, y: 0.5 }
  });

  // 1. 初始化 Three.js 场景
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    refs.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 12);
    refs.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.current.renderer = renderer;

    // 轨道控制器 (支持拖拽和缩放)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    refs.current.controls = controls;

    // 光源
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pl = new THREE.PointLight(0xffffff, 2);
    pl.position.set(10, 10, 10);
    scene.add(pl);

    // 装饰品组
    const ornamentGroup = new THREE.Group();
    scene.add(ornamentGroup);
    refs.current.ornamentGroup = ornamentGroup;

    // 粒子系统
    const geometry = new THREE.SphereGeometry(0.04, 8, 8);
    const material = new THREE.MeshStandardMaterial({ emissiveIntensity: 2 });
    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT);
    refs.current.instancedMesh = mesh;
    scene.add(mesh);

    const tempParticles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const h = Math.random();
      const y = (h * 7) - 3;
      const radius = Math.max(0.1, (1 - h) * 3.5);
      const angle = Math.random() * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

      mesh.setColorAt(i, new THREE.Color(TREE_COLORS[i % TREE_COLORS.length]));
      tempParticles.push({
        pos: pos.clone(),
        basePos: pos.clone(),
        vel: new THREE.Vector3(),
        phase: Math.random() * 10
      });
    }
    refs.current.particles = tempParticles;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // 2. 动画主循环
    const dummy = new THREE.Object3D();
    let animId: number;
    const animate = () => {
      const time = performance.now() * 0.001;

      // 更新控制器
      if (refs.current.controls) refs.current.controls.update();

      // 更新粒子
      refs.current.particles.forEach((p, i) => {
        const target = new THREE.Vector3();
        if (state === 'explode') {
          target.copy(p.pos).normalize().multiplyScalar(10);
          p.vel.lerp(target, 0.05);
        } else if (state === 'vortex') {
          p.pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.1);
          target.set(0, p.pos.y, 0);
          p.vel.lerp(target.sub(p.pos).multiplyScalar(0.2), 0.1);
        } else {
          const breathe = 1 + Math.sin(time * 2 + p.phase) * 0.05;
          target.copy(p.basePos).multiplyScalar(breathe);
          p.vel.lerp(target.sub(p.pos), 0.05);
        }
        p.pos.add(p.vel);
        p.vel.multiplyScalar(0.92);

        dummy.position.copy(p.pos);
        const s = 1.0 + Math.sin(time * 4 + p.phase) * 0.5;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;

      // 手势微调相机 (如果没在点击拖拽)
      if (isCameraActive && state === 'idle') {
        scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, (refs.current.handPos.x - 0.5) * 1.5, 0.05);
      } else {
        if (state === 'idle') scene.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [state, isCameraActive]);

  // 3. 处理图片挂载
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !refs.current.scene || !refs.current.ornamentGroup) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(ev.target?.result as string);

        // 计算随机挂载点
        const h = Math.random() * 0.8;
        const y = (h * 7) - 3;
        const radius = (1 - h) * 3.5;
        const angle = Math.random() * Math.PI * 2;
        const pos = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

        // 创建 3D 照片挂件
        const geom = new THREE.CircleGeometry(0.5, 32);
        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const ornament = new THREE.Mesh(geom, mat);
        ornament.position.copy(pos);
        ornament.lookAt(0, y, 0);
        refs.current.ornamentGroup!.add(ornament);

        setPhotos(prev => [...prev, { id: Math.random().toString(), texture, pos }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const clearPhotos = () => {
    if (refs.current.ornamentGroup) {
      while(refs.current.ornamentGroup.children.length > 0) {
        refs.current.ornamentGroup.remove(refs.current.ornamentGroup.children[0]);
      }
    }
    setPhotos([]);
  };

  // 4. MediaPipe AI 逻辑 (保持稳定)
  useEffect(() => {
    async function init() {
      const v = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
      refs.current.handLandmarker = await HandLandmarker.createFromOptions(v, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
      });
    }
    init();
  }, []);

  useEffect(() => {
    let id: number;
    const detect = async () => {
      if (refs.current.handLandmarker && videoRef.current && isCameraActive && videoRef.current.readyState >= 2) {
        const r = await refs.current.handLandmarker.detectForVideo(videoRef.current, performance.now());
        if (r.landmarks?.length) {
          const l = r.landmarks[0];
          refs.current.handPos = { x: 1 - l[0].x, y: l[0].y };
          const p = Math.hypot(l[4].x-l[8].x, l[4].y-l[8].y);
          if (p < 0.04) setState('focus');
          else if (l[8].y > l[6].y) setState('vortex');
          else if (l[8].y < l[6].y && p > 0.1) setState('explode');
          else setState('idle');
        }
      }
      id = requestAnimationFrame(detect);
    };
    detect();
    return () => cancelAnimationFrame(id);
  }, [isCameraActive]);

  useEffect(() => {
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(s => { if (videoRef.current) videoRef.current.srcObject = s; });
    }
  }, [isCameraActive]);

  return (
    <div className="flex flex-col gap-4 p-2 max-w-6xl mx-auto w-full h-[90vh] bg-slate-950 text-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <RotateCcw className="text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">GLOW TREE PRO</h2>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase opacity-60">Interactive 3D Ornament Engine</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${isCameraActive ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'}`}
          >
            <Camera size={16} />
            {isCameraActive ? 'STOP AI' : 'ENABLE MOTION'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative flex-1 group">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Help Overlay */}
        <div className="absolute top-6 left-8 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-[10px] space-y-2">
            <p className="opacity-50 uppercase font-black">Controls</p>
            <p>🖱️ <span className="opacity-70 ml-2">Drag to Rotate</span></p>
            <p>🎡 <span className="opacity-70 ml-2">Scroll to Zoom</span></p>
            <p>🖐️ <span className="opacity-70 ml-2 tracking-widest">Pinch / Fist / Palm</span></p>
          </div>
        </div>

        {isCameraActive && (
          <div className="absolute top-6 right-8 w-44 h-32 rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl z-50">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale invert" />
          </div>
        )}

        {/* Dynamic Status Markers */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
          {['focus', 'explode', 'vortex'].map(s => (
            <div key={s} className={`px-4 py-2 rounded-full border text-[9px] font-black tracking-[0.2em] transition-all uppercase ${state === s ? 'bg-white text-black border-white' : 'bg-black/40 text-gray-500 border-white/10 opacity-30'}`}>
              Mode: {s}
            </div>
          ))}
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-6 bg-black/30 backdrop-blur-2xl border-t border-white/10 flex flex-wrap sm:flex-nowrap gap-4 items-center">
        <label className="flex-shrink-0 flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-3xl cursor-pointer transition-all shadow-xl shadow-emerald-900/40 active:scale-95 group">
          <Upload size={20} className="text-white group-hover:-translate-y-1 transition-transform" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-white leading-none">Add Photo</span>
            <span className="text-[8px] text-white/60 mt-1 uppercase">3D Hanging Decor</span>
          </div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </label>

        <div className="flex-1 grid grid-cols-3 gap-2">
           <button onClick={() => setState('focus')} className={`py-4 rounded-3xl border transition-all font-black text-[9px] uppercase tracking-widest ${state === 'focus' ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>Pinch</button>
           <button onClick={() => setState('explode')} className={`py-4 rounded-3xl border transition-all font-black text-[9px] uppercase tracking-widest ${state === 'explode' ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>Explode</button>
           <button onClick={() => setState('vortex')} className={`py-4 rounded-3xl border transition-all font-black text-[9px] uppercase tracking-widest ${state === 'vortex' ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>Vortex</button>
        </div>

        <button onClick={clearPhotos} className="px-6 py-4 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-3xl transition-all flex items-center gap-2 group border border-red-900/20">
          <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase">Clear All</span>
        </button>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
