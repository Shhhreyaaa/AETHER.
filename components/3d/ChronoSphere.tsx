'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, DragControls, Line } from '@react-three/drei';
import { useAetherStore } from '@/store/useAetherStore';
import { getPrioritizedTasks } from '@/lib/ai/weaver';
import { useState, useRef } from 'react';
import * as THREE from 'three';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';

interface TaskNodeProps {
  task: any;
  position: [number, number, number];
  onSelect: (task: any) => void;
  onDrag: (taskId: string, position: THREE.Vector3) => void;
  onDragEnd: (taskId: string, newPosition: THREE.Vector3) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function TaskNode({ task, position, onSelect, onDrag, onDragEnd, onHoverStart, onHoverEnd }: TaskNodeProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = task.priority > 80 ? '#ef4444' : task.priority > 60 ? '#f59e0b' : '#3b82f6';

  useFrame(() => {
    if (meshRef.current) {
      // Smoothly animate scale on hover
      const targetScale = hovered ? 1.35 : 1.0;
      const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15);
      meshRef.current.scale.set(s, s, s);
      
      // Gentle spin
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <DragControls
      onDrag={() => {
        if (groupRef.current) {
          onDrag(task.id, groupRef.current.position);
        }
      }}
      onDragEnd={() => {
        if (groupRef.current) {
          onDragEnd(task.id, groupRef.current.position);
        }
      }}
    >
      <group ref={groupRef} position={position}>
        {/* Main Task Sphere */}
        <mesh
          ref={meshRef}
          onClick={() => onSelect(task)}
          onPointerOver={() => {
            setHovered(true);
            onHoverStart();
            document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            setHovered(false);
            onHoverEnd();
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[0.95, 32, 32]} />
          <meshPhongMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            shininess={90}
          />
        </mesh>

        {/* Outer Glow Ring */}
        <mesh>
          <ringGeometry args={[1.15, 1.35, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 0.25 : 0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </DragControls>
  );
}

export default function ChronoSphere() {
  const { tasks, userProfile, updateTask } = useAetherStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [draggedInfo, setDraggedInfo] = useState<{ taskId: string; x: number; y: number } | null>(null);

  const prioritizedTasks = getPrioritizedTasks(tasks, userProfile.energyProfile).slice(0, 8);

  // Position tasks in a sphere formation
  const getPosition = (index: number, total: number): [number, number, number] => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 5.2;
    const y = (index % 3 - 1) * 2.2;
    return [
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius * 0.75,
    ];
  };

  const handleDrag = (taskId: string, position: THREE.Vector3) => {
    setDraggedInfo({ taskId, x: position.x, y: position.y });
  };

  const handleDragEnd = (taskId: string, newPosition: THREE.Vector3) => {
    setDraggedInfo(null);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Y maps to priority (range: 10 to 100)
    const newPriority = Math.max(10, Math.min(100, Math.floor(50 + newPosition.y * 12)));

    // X maps to deadline (range: 4 hours to 96 hours)
    const normalizedX = Math.max(0, Math.min(1, (newPosition.x + 6) / 12));
    const hoursOffset = Math.floor(4 + normalizedX * 92);
    const baseDate = new Date(task.createdAt || Date.now());
    const newDueDate = new Date(baseDate.getTime() + hoursOffset * 3600 * 1000);

    updateTask(taskId, { 
      priority: newPriority, 
      dueDate: newDueDate.toISOString() 
    });

    toast.success(`Rescheduled: "${task.title}"`, {
      description: `Priority updated to ${newPriority}%. Deadline set to +${hoursOffset}h.`
    });
  };

  return (
    <div className="relative h-[640px] w-full rounded-3xl overflow-hidden border border-white/10 bg-[#050507]">
      <Canvas camera={{ position: [0, 4, 14], fov: 48 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[12, 18, -8]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-12, -10, 8]} intensity={0.8} color="#3b82f6" />

        <Stars radius={120} count={90} factor={3} fade speed={0.5} />

        {/* Central AETHER Core */}
        <group>
          <mesh>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshPhongMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.9}
              shininess={100}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.6, 32, 32]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
          </mesh>
        </group>

        {/* Central Core Connection Lines */}
        {prioritizedTasks.map((task, index) => {
          const pos = getPosition(index, prioritizedTasks.length);
          const color = task.priority > 80 ? '#ef4444' : task.priority > 60 ? '#f59e0b' : '#3b82f6';
          const isHovered = hoveredTaskId === task.id;
          return (
            <Line
              key={`line-core-${task.id}`}
              points={[[0, 0, 0], pos]}
              color={color}
              lineWidth={isHovered ? 2.2 : 0.8}
              transparent
              opacity={isHovered ? 0.5 : 0.12}
            />
          );
        })}

        {/* Dependency Connection Lines */}
        {prioritizedTasks.flatMap((task, index) => {
          const startPos = getPosition(index, prioritizedTasks.length);
          return (task.dependencies || [])
            .map(depId => {
              const depIndex = prioritizedTasks.findIndex(t => t.id === depId);
              if (depIndex === -1) return null;
              const endPos = getPosition(depIndex, prioritizedTasks.length);
              const isRelated = hoveredTaskId === task.id || hoveredTaskId === depId;
              return (
                <Line
                  key={`line-dep-${task.id}-${depId}`}
                  points={[startPos, endPos]}
                  color="#a78bfa"
                  lineWidth={isRelated ? 2.5 : 1.2}
                  dashed
                  dashSize={0.25}
                  gapSize={0.15}
                  transparent
                  opacity={isRelated ? 0.8 : 0.3}
                />
              );
            })
            .filter((line): line is JSX.Element => line !== null);
        })}

        {/* Task Nodes */}
        {prioritizedTasks.map((task, index) => (
          <TaskNode
            key={task.id}
            task={task}
            position={getPosition(index, prioritizedTasks.length)}
            onSelect={setSelectedTask}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onHoverStart={() => setHoveredTaskId(task.id)}
            onHoverEnd={() => setHoveredTaskId(null)}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={7}
          maxDistance={22}
          autoRotate={!draggedInfo}
          autoRotateSpeed={0.08}
        />
      </Canvas>

      {/* Drag Telemetry Panel Overlay */}
      {draggedInfo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-blue-500/30 text-white rounded-2xl px-5 py-3.5 text-xs flex items-center gap-4 shadow-2xl z-20 pointer-events-none select-none font-mono">
          <div className="flex items-center gap-1.5 text-[#3b82f6]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span className="font-bold tracking-wider">AETHER TELEMETRY</span>
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div>
            X: <span className="text-white/80">{draggedInfo.x.toFixed(2)}</span> (Due: <span className="text-violet-400 font-semibold">+{Math.floor(4 + Math.max(0, Math.min(1, (draggedInfo.x + 6) / 12)) * 92)}h</span>)
          </div>
          <div className="h-4 w-px bg-white/15" />
          <div>
            Y: <span className="text-white/80">{draggedInfo.y.toFixed(2)}</span> (Priority: <span className="text-blue-400 font-semibold">{Math.max(10, Math.min(100, Math.floor(50 + draggedInfo.y * 12)))}%</span>)
          </div>
        </div>
      )}

      {/* Selected Task Info Panel */}
      {selectedTask && (
        <div className="absolute bottom-6 right-6 w-80 z-10">
          <GlassCard>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xs tracking-[2px] text-white/50">SELECTED TASK</div>
                <div className="font-semibold text-xl tracking-tight mt-1 pr-4">
                  {selectedTask.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-white/40 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/50 text-xs">PRIORITY</div>
                <div className="text-3xl font-semibold tracking-tighter text-[#3b82f6]">
                  {selectedTask.priority}
                </div>
              </div>
              <div>
                <div className="text-white/50 text-xs">ESTIMATED</div>
                <div className="text-xl font-medium mt-1">{selectedTask.estimatedMin} min</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-white/40">
              Drag the node to reschedule priority (Y) & deadline (X)
            </div>
          </GlassCard>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-6 left-6 text-xs px-4 py-2 rounded-full bg-black/40 border border-white/10 text-white/60">
        Drag nodes • Click to inspect • Scroll to zoom
      </div>
    </div>
  );
}
