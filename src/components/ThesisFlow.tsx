'use client';

import { useEffect, useRef, useState } from 'react';

interface ThesisData {
  id: number;
  title: string;
  degree: string;
  institution: string;
  supervisor: string;
  year: string;
  research_problem: string;
  objective: string;
  methodology: string;
  key_contributions: string;
  results: string;
  conclusions: string | null;
  future_work: string | null;
}

interface FlowNode {
  id: string;
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  borderColor: string;
  content: string;
}

function buildFlowNodes(thesis: ThesisData): FlowNode[] {
  const nodes: FlowNode[] = [
    {
      id: 'problem',
      label: 'Research Problem',
      icon: '🔍',
      color: 'from-rose-500/20 to-rose-500/5',
      glowColor: 'shadow-rose-500/30',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      content: thesis.research_problem,
    },
    {
      id: 'objective',
      label: 'Objective',
      icon: '🎯',
      color: 'from-amber-500/20 to-amber-500/5',
      glowColor: 'shadow-amber-500/30',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      content: thesis.objective,
    },
    {
      id: 'methodology',
      label: 'Methodology',
      icon: '⚙️',
      color: 'from-cyan-500/20 to-cyan-500/5',
      glowColor: 'shadow-cyan-500/30',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      content: thesis.methodology,
    },
    {
      id: 'contributions',
      label: 'Key Contributions',
      icon: '💡',
      color: 'from-violet-500/20 to-violet-500/5',
      glowColor: 'shadow-violet-500/30',
      borderColor: 'border-violet-500/40 hover:border-violet-400',
      content: thesis.key_contributions,
    },
    {
      id: 'results',
      label: 'Results',
      icon: '📊',
      color: 'from-emerald-500/20 to-emerald-500/5',
      glowColor: 'shadow-emerald-500/30',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      content: thesis.results,
    },
  ];

  if (thesis.conclusions) {
    nodes.push({
      id: 'conclusions',
      label: 'Conclusions',
      icon: '✅',
      color: 'from-blue-500/20 to-blue-500/5',
      glowColor: 'shadow-blue-500/30',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      content: thesis.conclusions,
    });
  }

  if (thesis.future_work) {
    nodes.push({
      id: 'future',
      label: 'Future Directions',
      icon: '🚀',
      color: 'from-fuchsia-500/20 to-fuchsia-500/5',
      glowColor: 'shadow-fuchsia-500/30',
      borderColor: 'border-fuchsia-500/40 hover:border-fuchsia-400',
      content: thesis.future_work,
    });
  }

  return nodes;
}

export default function ThesisFlow({ thesis }: { thesis: ThesisData }) {
  const nodes = buildFlowNodes(thesis);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [revealedNodes, setRevealedNodes] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for progressive reveal
  useEffect(() => {
    const nodeEls = containerRef.current?.querySelectorAll('[data-node]');
    if (!nodeEls) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nodeId = entry.target.getAttribute('data-node');
            if (nodeId) {
              setRevealedNodes((prev) => new Set([...prev, nodeId]));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );

    nodeEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Central vertical spine */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="rgba(100,116,139,0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="space-y-0">
        {nodes.map((node, idx) => {
          const isLeft = idx % 2 === 0;
          const isRevealed = revealedNodes.has(node.id);
          const isActive = activeNode === node.id;
          const isLast = idx === nodes.length - 1;

          return (
            <div key={node.id} className="relative" data-node={node.id}>
              {/* Diagonal connector line to next node */}
              {!isLast && (
                <div className="hidden md:block absolute top-0 bottom-0 left-0 right-0" style={{ zIndex: 0 }}>
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <line
                      x1={isLeft ? '75%' : '25%'}
                      y1="50%"
                      x2={!isLeft ? '75%' : '25%'}
                      y2="100%"
                      stroke={isRevealed ? getNodeColor(nodes[idx]) : 'rgba(100,116,139,0.15)'}
                      strokeWidth="1"
                      strokeDasharray="6 4"
                    />
                  </svg>
                </div>
              )}

              {/* Vertical connector dot line segment */}
              {!isLast && (
                <div
                  className="absolute left-8 md:left-1/2 -translate-x-1/2 top-0 h-full w-px overflow-hidden"
                  style={{ zIndex: 1 }}
                >
                  <div
                    className="w-full h-full transition-all duration-1000"
                    style={{
                      background: isRevealed
                        ? `linear-gradient(to bottom, ${getNodeColor(nodes[idx])}, ${getNodeColor(nodes[idx + 1])})`
                        : 'rgba(100,116,139,0.2)',
                    }}
                  />
                  {/* Pulse traveling down the line */}
                  {isRevealed && (
                    <div
                      className="absolute top-0 left-0 w-full h-8 opacity-60"
                      style={{
                        background: `linear-gradient(to bottom, transparent, ${getNodeColor(nodes[idx])}, transparent)`,
                        animation: `nodePulse 2s ease-in-out infinite`,
                        animationDelay: `${idx * 0.3}s`,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Node content */}
              <div
                className={`relative flex items-start gap-0 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Spacer for alternating layout — reduced to let cards fill more width */}
                <div className="hidden md:block md:w-[15%]" />

                {/* Node connector dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center transition-all duration-500"
                    style={{
                      borderColor: isRevealed ? getNodeColorRaw(nodes[idx]) : undefined,
                      boxShadow: isRevealed
                        ? `0 0 12px ${getNodeColorRaw(nodes[idx])}40, 0 0 24px ${getNodeColorRaw(nodes[idx])}20`
                        : undefined,
                      transform: isRevealed ? 'scale(1)' : 'scale(0.5)',
                      opacity: isRevealed ? 1 : 0.3,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: isRevealed ? getNodeColorRaw(nodes[idx]) : '#475569',
                      }}
                    />
                  </div>
                </div>

                {/* Card — wider to fill page margins */}
                <div
                  className={`w-full md:w-[85%] ${
                    isLeft ? 'md:pr-8 pl-16 md:pl-0' : 'md:pl-8 pl-16'
                  } pb-12`}
                >
                  <div
                    className="transition-all duration-700"
                    style={{
                      opacity: isRevealed ? 1 : 0,
                      transform: isRevealed
                        ? 'none'
                        : isLeft
                        ? 'translateX(-2rem)'
                        : 'translateX(2rem)',
                    }}
                  >
                    <div
                      data-day-card
                      className={`
                        relative rounded-2xl border bg-gradient-to-br ${node.color}
                        ${node.borderColor} cursor-pointer
                        transition-all duration-300
                        ${isActive ? `shadow-lg ${node.glowColor}` : ''}
                      `}
                      onClick={() => setActiveNode(isActive ? null : node.id)}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 p-5 pb-3">
                        <span className="text-2xl">{node.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {node.label}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getNodeColorRaw(nodes[idx]) }}
                            />
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              Node {idx + 1} of {nodes.length}
                            </span>
                          </div>
                        </div>
                        {/* Expand indicator */}
                        <div
                          className="ml-auto transition-transform duration-300"
                          style={{
                            transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Content preview (always visible) */}
                      <div className="px-5 pb-4">
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                          {node.content}
                        </p>
                      </div>

                      {/* Expanded content */}
                      <div
                        className="overflow-hidden transition-all duration-500"
                        style={{
                          maxHeight: isActive ? '600px' : '0px',
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <div className="px-5 pb-5 border-t border-white/5 pt-4">
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {node.content}
                          </p>
                        </div>
                      </div>

                      {/* Bottom accent bar */}
                      <div
                        className="h-0.5 rounded-b-2xl transition-all duration-500"
                        style={{
                          background: isActive
                            ? `linear-gradient(to right, transparent, ${getNodeColorRaw(nodes[idx])}, transparent)`
                            : 'transparent',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final node indicator */}
      <div className="relative">
        <div className="absolute left-8 md:left-1/2 -translate-x-1/2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-violet-500/30" />
        </div>
      </div>

      {/* Pulse animation injected via useEffect */}
      <PulseStyles />
    </div>
  );
}

// Inject keyframes for pulse animation
function PulseStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes nodePulse {
        0% { transform: translateY(-100%); opacity: 0; }
        30% { opacity: 0.8; }
        100% { transform: translateY(60px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return null;
}

// Color helpers
const colorMap: Record<string, string> = {
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  emerald: '#10b981',
  blue: '#3b82f6',
  fuchsia: '#d946ef',
};

function getNodeColorRaw(node: FlowNode): string {
  const colorName = node.color.split('-')[1];
  return colorMap[colorName] || '#64748b';
}

function getNodeColor(node: FlowNode): string {
  return getNodeColorRaw(node) + '40';
}
