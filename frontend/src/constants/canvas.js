// Fixed internal drawing resolution shared by the canvas and the remote
// cursor overlay. Every client uses the same logical resolution, so raw
// pixel coordinates can be sent over the socket as-is (no normalization
// needed) and still line up correctly on every screen.
export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;
