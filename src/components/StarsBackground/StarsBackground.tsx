import { useEffect, useRef } from "react";
import "./StarsBackground.css"

type Star = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    a: number;
}

const MIN_EFFECT_RADIUS = 40;
const SIZE_EFFECT_FACTOR = 30;
const ORBIT_TAN_GAIN = 6.0;
const RADIAL_DAMP_GAIN = 7.0;
const INWARD_PULL_GAIN = 2.2;
const MIN_SPEED = 0.02;
const MAX_SPEED = 1.2;
const SPEED_DAMP = 0.995;
const BASE_ORBIT_SPEED = 0.25;
const SIZE_ORBIT_SPEED_BOOST = 0.22;
const BASE_GLOW_BLUR = 6;
const BASE_GLOW_ALPHA = 0.18;
const ORBIT_GLOW_BLUR_MAX = 26;
const ORBIT_GLOW_ALPHA_MAX = 0.55;
const GLOW_PULSE_SPEED = 6.0;

export default function StarsBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const startsRef = useRef<Star[]>([]);
    const rafRef = useRef<number | null>(null);
    const mouseRef = useRef<{ x: number, y: number } | null>(null);
    const timeRef = useRef<number>(0);
    const lastTRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

        const resize = () => {
            const { innerWidth: width, innerHeight: height } = window;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.floor((width * height) / 9000);
            startsRef.current = makeStars(count, width, height);
        };

        const handleMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        }

        const tick = (t: number) => {
            const { innerWidth: width, innerHeight: height } = window;

            if (!ctx) return;

            const last = lastTRef.current ?? t;
            const dt = Math.min(1.0 / 30, (t - last) / 1000);
            lastTRef.current = t;
            timeRef.current += dt;

            ctx.clearRect(0, 0, width, height);

            const mouse = mouseRef.current;
            const time = timeRef.current;

            for (const s of startsRef.current) {
                ctx.shadowBlur = BASE_GLOW_BLUR;
                ctx.shadowColor = `rgba(94, 234, 212, ${BASE_GLOW_ALPHA})`;

                if (mouse) {
                    const dx = mouse.x - s.x;
                    const dy = mouse.y - s.y;
                    const dist = Math.hypot(dx, dy) || 0.0001;

                    const effectRadius = MIN_EFFECT_RADIUS + s.r * SIZE_EFFECT_FACTOR;

                    if (dist < effectRadius) {
                        const p = 1 - dist / effectRadius;

                        const nx = dx / dist;
                        const ny = dy / dist;

                        const tx = -ny;
                        const ty = nx;

                        const vr = s.vx * nx + s.vy * ny;
                        const vt = s.vx * tx + s.vy * ty;

                        const speed = Math.hypot(s.vx, s.vy);
                        const speedFactor = 1 / (1 + speed * 1.5);

                        const targetVt = (BASE_ORBIT_SPEED + s.r * SIZE_ORBIT_SPEED_BOOST) * (0.35 + 0.65 * p);
                        const tangAccel = (targetVt - vt) * ORBIT_TAN_GAIN * p;
                        const radDampAccel = (-vr) * RADIAL_DAMP_GAIN * p * speedFactor;
                        const inAccel = INWARD_PULL_GAIN * p * speedFactor;

                        s.vx += (tx * tangAccel + nx * (radDampAccel + inAccel)) * dt;
                        s.vy += (ty * tangAccel + ny * (radDampAccel + inAccel)) * dt;

                        const pulse = 0.5 + 0.5 * Math.sin(time * GLOW_PULSE_SPEED + (s.x + s.y) * 0.01);
                        const glow = p * pulse;

                        ctx.shadowBlur = BASE_GLOW_BLUR + glow * ORBIT_GLOW_BLUR_MAX;
                        ctx.shadowColor = `rgba(94, 234, 212, ${0.35 * BASE_GLOW_ALPHA + glow * ORBIT_GLOW_ALPHA_MAX})`;
                    }
                }

                s.vx *= SPEED_DAMP;
                s.vy *= SPEED_DAMP;

                const sp = Math.hypot(s.vx, s.vy);
                if (sp > MAX_SPEED) {
                    const k = MAX_SPEED / sp;
                    s.vx *= k;
                    s.vy *= k;
                } else if (sp < MIN_SPEED) {
                    const k = MIN_SPEED / sp;
                    s.vx *= k;
                    s.vy *= k;
                }

                s.x += s.vx;
                s.y += s.vy;

                if (s.x < -10) s.x = width + 10;
                if (s.x > width + 10) s.x = -10;
                if (s.y < -10) s.y = height + 10;
                if (s.y > height + 10) s.y = -10;

                ctx.globalAlpha = s.a;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(225, 225, 221, 1)";
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMove);
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);


    return (
        <div className="stars-layer" aria-hidden="true">
            <canvas className="stars-canvas" ref={canvasRef}></canvas>
        </div>
    );
}


function makeStars(count: number, width: number, height: number): Star[] {
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
        stars.push({
            x: rand(0, width),
            y: rand(0, height),
            vx: rand(-0.1, 0.1),
            vy: rand(-0.15, 0.08),
            r: rand(0.6, 2.5),
            a: rand(0.25, 0.9),
        });
    }
    return stars;
}

function rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}