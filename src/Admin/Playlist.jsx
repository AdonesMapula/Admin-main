import React, { useState, useEffect } from "react";
import { db } from "../Firebase/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

function Playlist() {
    const [playlists, setPlaylists] = useState([]);
    const [title, setTitle] = useState("");
    const [playlistId, setPlaylistId] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const playlistsCollectionRef = collection(db, "playlists");
  
    // Fetch playlists from Firestore
    useEffect(() => {
      const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
          const data = await getDocs(playlistsCollectionRef);
          setPlaylists(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching playlists:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlaylists();
    }, []);
  
    // Add or update playlist
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!title || !playlistId) {
        alert("Please enter both title and playlist ID.");
        return;
      }
  
      try {
        if (editingId) {
          const playlistDoc = doc(db, "playlists", editingId);
          await updateDoc(playlistDoc, { title, playlistId });
          setPlaylists(playlists.map(p => p.id === editingId ? { id: editingId, title, playlistId } : p));
          setEditingId(null);
        } else {
          const docRef = await addDoc(playlistsCollectionRef, { title, playlistId });
          setPlaylists([...playlists, { id: docRef.id, title, playlistId }]);
        }
        setTitle("");
        setPlaylistId("");
      } catch (error) {
        console.error("Error saving playlist:", error);
      }
    };
  
    // Edit playlist
    const handleEdit = (playlist) => {
      setTitle(playlist.title);
      setPlaylistId(playlist.playlistId);
      setEditingId(playlist.id);
    };
  
    // Delete playlist
    const handleDelete = async (id) => {
      try {
        await deleteDoc(doc(db, "playlists", id));
        setPlaylists(playlists.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting playlist:", error);
      }
    };
  
    // Reset form
    const handleCancel = () => {
      setTitle("");
      setPlaylistId("");
      setEditingId(null);
    };
  
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8 border-b border-gray-800 pb-4">
            <h1 className="text-4xl font-bold tracking-tight uppercase">
              <span className="inline-block transform -skew-x-12 bg-white text-black px-2 mr-2">PLAYLIST</span>
              MANAGEMENT
            </h1>
            <p className="text-gray-400 mt-2 italic">Drop your YouTube playlist IDs here</p>
          </header>
  
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-10 bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="grid gap-4 mb-6 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-gray-400 mb-2 uppercase text-sm font-bold">
                  Playlist Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Old School Hip-Hop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label htmlFor="playlistId" className="block text-gray-400 mb-2 uppercase text-sm font-bold">
                  YouTube Playlist ID
                </label>
                <input
                  id="playlistId"
                  type="text"
                  placeholder="e.g. PL1234abcdEFG5678"
                  value={playlistId}
                  onChange={(e) => setPlaylistId(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-white text-black font-bold py-3 px-6 rounded-md uppercase tracking-wider hover:bg-gray-200 transition duration-200"
              >
                {editingId ? "Update" : "Add"} Playlist
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-transparent border border-gray-700 text-gray-300 font-bold py-3 px-6 rounded-md uppercase tracking-wider hover:bg-gray-900 transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
  
          {/* Playlists Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide flex items-center">
              <span className="inline-block h-1 w-8 bg-white mr-3"></span>
              Your Playlists
            </h2>
  
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                <p className="text-gray-500">No playlists yet. Add your first one above.</p>
              </div>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {playlists.map((playlist) => (
                  <li key={playlist.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition duration-200">
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2">{playlist.title}</h3>
                      <a 
                        href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white text-sm truncate block mb-4"
                      >
                        {playlist.playlistId}
                      </a>
                      <div className="flex space-x-3">
                        <a 
                          href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white text-black px-4 py-2 rounded font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition duration-200"
                        >
                          Play
                        </a>
                        <button 
                          onClick={() => handleEdit(playlist)}
                          className="bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(playlist.id)}
                          className="bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded font-bold text-sm uppercase tracking-wider hover:bg-red-900 hover:border-red-700 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default Playlist;
  