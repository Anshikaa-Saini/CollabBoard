import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RoomCard from "../components/RoomCard";
import CreateRoomDialog from "../components/CreateRoomDialog";
import JoinRoomDialog from "../components/JoinRoomDialog";
import AlertBanner from "../components/AlertBanner";
import { useAuth } from "../context/AuthContext";
import { createRoomApi, joinRoomApi, getMyRoomsApi } from "../api/roomApi";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    setFetchError("");
    try {
      const res = await getMyRoomsApi();
      setRooms(res.data.data.rooms);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load your rooms");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = async (name) => {
    const res = await createRoomApi({ name });
    const room = res.data.data.room;
    navigate(`/room/${room._id}`);
  };

  const handleJoinRoom = async (code) => {
    const res = await joinRoomApi({ code });
    const room = res.data.data.room;
    navigate(`/room/${room._id}`);
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
                Start a brand new whiteboard and invite teammates to collaborate.
              </p>
            </div>
            <button onClick={() => setCreateOpen(true)} className="btn-primary mt-6 w-full">
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
            <button onClick={() => setJoinOpen(true)} className="btn-secondary mt-6 w-full">
              Join Room
            </button>
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Recent Rooms</h2>

          <AlertBanner message={fetchError} />

          {loadingRooms ? (
            <div className="card flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
            </div>
          ) : rooms.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} currentUserId={user?._id} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateRoomDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateRoom}
      />
      <JoinRoomDialog open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={handleJoinRoom} />
    </div>
  );
};

export default Dashboard;
