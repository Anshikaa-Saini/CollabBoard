import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = () => {
    // Milestone 2+ will wire this up to a real Rooms API
    alert("Room creation will be available in the next milestone.");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    alert("Joining rooms will be available in the next milestone.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new whiteboard room or join an existing one to start collaborating.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Create Room */}
          <div className="card flex flex-col justify-between">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary-600"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Create a Room</h2>
              <p className="mt-1 text-sm text-gray-500">
                Start a brand new whiteboard and invite teammates to collaborate in real time.
              </p>
            </div>
            <button onClick={handleCreateRoom} className="btn-primary mt-6 w-full">
              Create Room
            </button>
          </div>

          {/* Join Room */}
          <div className="card flex flex-col justify-between">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary-600"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Join a Room</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter a room code shared with you to jump into an existing whiteboard.
              </p>
            </div>
            <form onSubmit={handleJoinRoom} className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn-secondary shrink-0">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Recent Rooms</h2>
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-gray-400"
              >
                <rect x="3" y="3" width="18" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M7 8h10M7 12h6" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">No whiteboard yet.</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Create your first room or join one to see it appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
