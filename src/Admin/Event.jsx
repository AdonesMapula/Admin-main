import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Search, Eye, X, Pencil, Trash, Music, Calendar, FileText,User } from "lucide-react";
import { db } from "../Firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const Event = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ 
    name: "", 
    year: "", 
    description: "", 
    photo: null,
    playlistId: "" 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editEventId, setEditEventId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const eventsPerPage = 4;
  const handleImageClick = (imageUrl) => {
    console.log("Image clicked:", imageUrl);
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };
  
  useEffect(() => {
    fetchEvents();
    fetchPlaylists();
  }, []);

  useEffect(() => {
    console.log("Modal visibility:", showImageModal);
  }, [showImageModal]);
  

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(eventData);
      setFilteredEvents(eventData);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "playlists"));
      const playlistData = querySnapshot.docs.map((doc) => ({
        id: doc.data().playlistId,
        title: doc.data().title,
      }));
      setPlaylists(playlistData);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error("Failed to load playlists");
    }
  };
  

  const handleSaveEvent = async () => {
    if (!newEvent.name || !newEvent.year || !newEvent.description) {
      toast.error("Please fill in all required fields!");
      return;
    }
  
    setConfirmSave(true);
  };
  
  const confirmSaveEvent = async () => {
    try {
        const uploadedImageUrl = imageFile ? await handleImageUpload() : newEvent.photo;
        if (!uploadedImageUrl) return;

        const eventData = { 
            ...newEvent, 
            photo: uploadedImageUrl,
            youtubePlaylistId: newEvent.playlistId
        };

        if (editEventId) {
            await updateDoc(doc(db, "events", editEventId), eventData);
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === editEventId ? { id: editEventId, ...eventData } : event
                )
            );
            toast.success("Event updated successfully!");
        } else {
            const docRef = await addDoc(collection(db, "events"), eventData);
            setEvents((prevEvents) => [...prevEvents, { id: docRef.id, ...eventData }]);
            toast.success("Event added successfully!");
        }

        setShowForm(false);
        setNewEvent({ name: "", year: "", description: "", photo: null, playlistId: "" });
        setImageFile(null);
        setEditEventId(null);
        setConfirmSave(false);
    } catch (error) {
        console.error("Error saving event:", error);
        toast.error("Failed to save event");
    }
};

  
  const handleEditEvent = (event) => {
    setEditEventId(event.id);
    setNewEvent({
      name: event.name,
      year: event.year,
      description: event.description,
      photo: event.photo,
      playlistId: event.playlistId || ""
    });
    setShowForm(true);
  };
  
  const handleDeleteEvent = (eventId) => {
    setConfirmDelete(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "events", confirmDelete));
      setEvents((prevEvents) => prevEvents.filter(event => event.id !== confirmDelete));
      toast.success("Event deleted successfully!");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };
  
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter((event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.year.toString().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, events]);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select an image to upload.");
    
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "bshhhijy");
    formData.append("folder", "event_images");
    
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dznhei4mc/image/upload", formData);
      return response.data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // Find playlist title by ID
  const getPlaylistTitle = (playlistId) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist ? playlist.title : "No playlist selected";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <ToastContainer />
      <Transition show={showForm} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50" onClose={() => setShowForm(false)}>
          <Dialog.Panel className="relative bg-gray-900 p-8 rounded-lg shadow-2xl w-[90%] max-w-md text-white border border-gray-800">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white transition" onClick={() => setShowForm(false)}>
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="inline-block transform -skew-x-12 bg-white text-black px-2 mr-3">
                {editEventId ? "EDIT" : "NEW"}
              </span>
              EVENT
            </h3>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-gray-400 uppercase text-sm font-bold mb-2">Event Name</label>
                <input
                  type="text"
                  placeholder="Enter event name"
                  className="w-full p-3 bg-black border border-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-white"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 uppercase text-sm font-bold mb-2">Year</label>
                <input
                  type="number"
                  placeholder="YYYY"
                  className="w-full p-3 bg-black border border-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-white"
                  value={newEvent.year}
                  onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 uppercase text-sm font-bold mb-2">Description</label>
                <textarea
                  placeholder="Enter event description"
                  rows="3"
                  className="w-full p-3 bg-black border border-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-white"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 uppercase text-sm font-bold mb-2">
                  <span className="flex items-center">
                    <Music size={16} className="mr-2" /> 
                    Associated Playlist
                  </span>
                </label>
                <select
                  className="w-full p-3 bg-black border border-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-white"
                  value={newEvent.playlistId}
                  onChange={(e) => setNewEvent({ ...newEvent, playlistId: e.target.value })}
                >
                  <option value="">-- Select a Playlist --</option>
                  {playlists.map(playlist => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.title}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label className="block text-gray-400 uppercase text-sm font-bold mb-2">Event Photo</label>
                <div className="flex items-center p-3 bg-black border border-gray-700 rounded-md text-white">
                  <input
                    type="file"
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
              </div>
              <button 
                className="mt-2 bg-white text-black font-bold py-3 px-6 rounded-md uppercase tracking-wider hover:bg-gray-200 transition duration-200"
                onClick={handleSaveEvent}
              >
                {editEventId ? "Update" : "Add"} Event
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      <Transition show={confirmDelete !== null} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50" onClose={() => setConfirmDelete(null)}>
          <Dialog.Panel className="bg-gray-900 p-6 rounded-lg shadow-lg border border-red-900 text-white max-w-sm w-full">
            <h3 className="text-xl font-bold mb-3">DELETE EVENT</h3>
            <p className="mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-5 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2 bg-red-700 rounded-md text-white hover:bg-red-800"
                onClick={confirmDeleteEvent}
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      <Transition show={confirmSave} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50" onClose={() => setConfirmSave(false)}>
          <Dialog.Panel className="bg-gray-900 p-6 rounded-lg shadow-lg border border-white text-white max-w-sm w-full">
            <h3 className="text-xl font-bold mb-3">CONFIRM SAVE</h3>
            <p className="mb-6">Save this event to your collection?</p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-5 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800"
                onClick={() => setConfirmSave(false)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200"
                onClick={confirmSaveEvent}
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
      <Transition show={showImageModal} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm z-50" onClose={() => setShowImageModal(false)}>
          <Dialog.Panel className="relative bg-black p-2 rounded-lg shadow-lg w-[90%] max-w-3xl border border-gray-800">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-white z-10 bg-black bg-opacity-50 rounded-full p-1" onClick={() => setShowImageModal(false)}>
              <X size={24} />
            </button>
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Event Preview" 
                className="w-full h-auto max-h-[80vh] rounded-lg object-contain" 
              />
            )}
          </Dialog.Panel>
        </Dialog>
      </Transition>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <span className="inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">EVENT</span>
            MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-2 italic">Rapollo Events </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button 
            onClick={() => setShowForm(true)}
            className="bg-gray-800 text-white font-bold py-3 px-6 rounded-md uppercase tracking-wider hover:bg-gray-200 transition duration-200 flex items-center"
          >
            <span className="mr-2">+</span> Add Event
          </button>
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full md:w-64 p-3 pl-10 bg-black border border-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          </div>
        </div>
        <div className="overflow-auto rounded-lg border border-gray-800 shadow-lg mb-6">
          <table className="w-auto min-w-full border-collapse bg-black text-left text-white">
            <thead className="bg-gray-900 uppercase font-bold tracking-wider text-sm">
              <tr>
                <th className="p-4 border-b border-gray-800">
                  <span className="flex items-center">
                    <Eye size={16} className="mr-2" /> Event
                  </span>
                </th>
                <th className="p-4 border-b border-gray-800">
                  <span className="flex items-center">
                    <User size={16} className="mr-2" /> Name
                  </span>
                </th>
                <th className="p-4 border-b border-gray-800">
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-2" /> Year
                  </span>
                </th>
                <th className="p-4 border-b border-gray-800">
                  <span className="flex items-center">
                    <FileText size={16} className="mr-2" /> Details
                  </span>
                </th>
                <th className="p-4 border-b border-gray-800">
                  <span className="flex items-center">
                    <Music size={16} className="mr-2" /> Playlist
                  </span>
                </th>
                <th className="p-4 border-b border-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No events found. Add your first event to get started.
                  </td>
                </tr>
              ) : (
                currentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                   <td onClick={() => handleImageClick(event.photo)} className="cursor-pointer p-4">
                      <img src={event.photo} alt="Event" className="w-20 h-20 object-cover rounded-lg" />
                    </td>
                    <td className="p-4">{event.name}</td>
                    <td className="p-4 text-gray-300">{event.year}</td>
                    <td className="p-4 text-gray-300">
                      <div className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                        {event.description}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {event.playlistId ? (
                        <span className="flex items-center">
                          <Music size={16} className="mr-2 text-gray-400" />
                          {getPlaylistTitle(event.playlistId)}
                        </span>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-3">
                        <button 
                          className="p-2 rounded-md border border-gray-700 hover:border-white transition"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Pencil size={18} className="text-gray-400 hover:text-white" />
                        </button>
                        <button 
                          className="p-2 rounded-md border border-gray-700 hover:border-red-600 transition"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash size={18} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredEvents.length > eventsPerPage && (
          <div className="flex justify-center mt-8 mb-4">
            <div className="inline-flex rounded-md shadow-sm bg-gray-900 p-1 border border-gray-800">
              {[...Array(Math.ceil(filteredEvents.length / eventsPerPage)).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`px-4 py-2 min-w-[40px] rounded ${
                    currentPage === number + 1 
                      ? 'bg-white text-black font-bold' 
                      : 'text-gray-400 hover:text-white'
                  } transition-colors`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {showImageModal && (
  <Transition show={showImageModal} as={Fragment}>
    <Dialog onClose={() => setShowImageModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <button onClick={() => setShowImageModal(false)} className="absolute top-2 right-2 text-white">✖</button>
        <img src={selectedImage} alt="Preview" className="max-w-full max-h-[80vh]" />
      </div>
    </Dialog>
  </Transition>
)}
    </div>
  );
};

export default Event;