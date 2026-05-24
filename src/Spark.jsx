export default function Spark({ size = 80, mood = 'happy' }) {
  const eyeY = mood === 'sleepy' ? 44 : 42
  const smileD = mood === 'cheer'
    ? 'M 30 56 Q 50 76 70 56'
    : mood === 'sleepy'
      ? 'M 36 58 Q 50 64 64 58'
      : 'M 32 56 Q 50 72 68 56'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Spark mascot"
    >
      <defs>
        <radialGradient id="sparkFace" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#sparkFace)" stroke="#f59e0b" strokeWidth="2" />
      <path
        d="M 50 12 L 44 28 L 52 28 L 46 42 L 58 24 L 50 24 L 56 12 Z"
        fill="#f97316"
        stroke="#c2410c"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="60" r="8" fill="url(#cheek)" />
      <circle cx="72" cy="60" r="8" fill="url(#cheek)" />
      <circle cx="38" cy={eyeY} r="3.6" fill="#422006" />
      <circle cx="62" cy={eyeY} r="3.6" fill="#422006" />
      <circle cx="39" cy={eyeY - 1} r="1.1" fill="#fff" />
      <circle cx="63" cy={eyeY - 1} r="1.1" fill="#fff" />
      <path
        d={smileD}
        fill="none"
        stroke="#422006"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
