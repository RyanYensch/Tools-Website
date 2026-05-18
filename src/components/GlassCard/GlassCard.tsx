import type { PropsWithChildren } from "react"
import "./GlassCard.css"

type GlassCardProps = PropsWithChildren<{
    className?: string;
}>;

export default function GlassCard({ className = "", children }: GlassCardProps) {
    return <div className={`glass glass-hover glass-card glow-violet ${className}`}>{children}</div>;
}