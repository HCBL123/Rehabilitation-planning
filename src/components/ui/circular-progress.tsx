const CircularProgress = ({ value }: { value: number }) => (
  <div className="relative">
    <svg className="w-32 h-32">
      <circle
        className="text-gray-200"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r="56"
        cx="64"
        cy="64"
      />
      <circle
        className="text-blue-600"
        strokeWidth="8"
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r="56"
        cx="64"
        cy="64"
        style={{
          strokeDasharray: `${2 * Math.PI * 56}`,
          strokeDashoffset: `${2 * Math.PI * 56 * (1 - value / 100)}`,
          transformOrigin: '50% 50%',
          transform: 'rotate(-90deg)'
        }}
      />
    </svg>
    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
      {value}%
    </span>
  </div>
);

export default CircularProgress;
