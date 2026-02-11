'use client';

/**
 * Remix-style gradient background: light greenish/blue/cream orbs on a soft base.
 * Renders behind all content (fixed, -z-10, pointer-events-none).
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-20"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 0% 0%, rgba(157, 184, 231, 0.5) 0%, transparent 55%),
          radial-gradient(ellipse 70% 70% at 50% 45%, rgba(121, 211, 176, 0.32) 0%, transparent 55%),
          radial-gradient(ellipse 80% 60% at 100% 100%, rgba(246, 232, 201, 0.5) 0%, transparent 55%),
          hsl(0, 0%, 99%)
        `,
      }}
    >
      <div
        className="absolute w-[80vw] h-[80vh] -top-[20%] -left-[20%] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(157, 184, 231, 0.4) 0%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'ambient-drift-1 24s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[60vw] h-[60vh] top-[20%] left-[30%] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(121, 211, 176, 0.35) 0%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'ambient-drift-2 28s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[70vw] h-[70vh] -bottom-[10%] -right-[10%] rounded-full opacity-55"
        style={{
          background: 'radial-gradient(circle, rgba(246, 232, 201, 0.45) 0%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'ambient-drift-3 22s ease-in-out infinite',
        }}
      />
    </div>
  );
}
