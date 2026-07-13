import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../constants/canvas";

const RemoteCursor = ({ name, color, x, y }) => {
  const left = `${(x / CANVAS_WIDTH) * 100}%`;
  const top = `${(y / CANVAS_HEIGHT) * 100}%`;

  return (
    <div
      className="absolute -translate-x-1 -translate-y-1 transition-[left,top] duration-75 ease-linear"
      style={{ left, top }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={color}
        stroke="white"
        strokeWidth="1"
      >
        <path d="M4 2l16 6-6 2-2 6-8-14z" />
      </svg>
      <span
        className="ml-4 -mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
};

export default RemoteCursor;
