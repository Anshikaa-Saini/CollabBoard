const BRUSH_COLORS = ["#111827", "#2563eb", "#ef4444", "#16a34a", "#f59e0b", "#a855f7"];

const Toolbar = ({
  tool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
      {/* Tool selector */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => onToolChange("pen")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tool === "pen"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pen
        </button>
        <button
          type="button"
          onClick={() => onToolChange("eraser")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tool === "eraser"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Eraser
        </button>
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-2">
        {BRUSH_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c ? "border-primary-600" : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-md border border-gray-200 bg-white"
          aria-label="Custom color picker"
        />
      </div>

      {/* Brush size */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Size</span>
        <input
          type="range"
          min="2"
          max="40"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-24 accent-primary-600"
          aria-label="Brush size"
        />
        <span
          className="shrink-0 rounded-full bg-gray-800"
          style={{ width: Math.min(brushSize, 24), height: Math.min(brushSize, 24) }}
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-secondary px-3 py-1.5 text-sm"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="btn-secondary px-3 py-1.5 text-sm"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="btn-secondary px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
        >
          Clear Board
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
