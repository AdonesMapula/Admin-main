import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../Firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Image,
  X 
} from "lucide-react";

function CreateTix() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalTickets, setTotalTickets] = useState("");


  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const querySnapshot = await getDocs(collection(db, "tickets"));
    const ticketList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTickets(ticketList);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!eventName || !eventDate || !venue || !ticketPrice) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const imageUrl = await handleImageUpload() || (editId ? tickets.find(t => t.id === editId)?.imageURL : null);
    if (!imageUrl && !editId) {
      setIsSubmitting(false);
      return;
    }

    const ticketData = { eventName, eventDate, venue, ticketPrice, totalTickets, imageURL: imageUrl };

    try {
      if (editId) {
        await updateDoc(doc(db, "tickets", editId), ticketData);
        toast.success("Ticket updated successfully!");
        setEditId(null);
      } else {
        await addDoc(collection(db, "tickets"), ticketData);
        toast.success("Ticket created successfully!");
      }
      resetForm();
      fetchTickets();
    } catch (error) {
      toast.error("Failed to save ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEdit = (ticket) => {
    setEditId(ticket.id);
    setEventName(ticket.eventName);
    setEventDate(ticket.eventDate);
    setVenue(ticket.venue);
    setTicketPrice(ticket.ticketPrice);
    setImagePreview(ticket.imageURL);
  };

  const handleCancelEdit = () => {
    // Reset the form and exit edit mode
    resetForm();
    setEditId(null);
  
    // Reset the file input manually
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';  // Clears the file input
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      toast.success("Ticket deleted successfully!");
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket: ", error);
      toast.error("Failed to delete ticket.");
    }
  };

  const resetForm = () => {
    setEventName("");
    setEventDate("");
    setVenue("");
    setTicketPrice("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            <span className="inline-block transform -skew-x-12 bg-white text-black px-2 mr-2">TICKET</span>
            MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-2 italic">Create event tickets here</p>
        </header>
  
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="p-6 text-white font-bold uppercase min-h-screen">
  <ToastContainer theme="dark" />
  <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl shadow-2xl border border-white">
    <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide border-b border-white pb-2">Create Event Ticket</h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text" 
        placeholder="Event Name" 
        value={eventName} 
        onChange={(e) => setEventName(e.target.value)} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none placeholder-gray-400"
      />
      <input 
        type="datetime-local" 
        value={eventDate} 
        onChange={(e) => setEventDate(e.target.value)} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none"
      />
      <input 
        type="text" 
        placeholder="Venue" 
        value={venue} 
        onChange={(e) => setVenue(e.target.value)} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none placeholder-gray-400"
      />
      <input 
        type="number" 
        placeholder="Price" 
        value={ticketPrice} 
        onChange={(e) => setTicketPrice(e.target.value)} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none placeholder-gray-400"
      />
      <input 
        type="number" 
        placeholder="Total Tickets Available" 
        value={totalTickets} 
        onChange={(e) => setTotalTickets(e.target.value)} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none placeholder-gray-400"
      />
      <input 
        type="file" 
        onChange={(e) => setImageFile(e.target.files[0])} 
        className="w-full p-3 bg-gray-800 text-white border border-white rounded-lg focus:ring-2 focus:ring-white outline-none"
      />
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full py-3 bg-white text-black rounded-lg font-bold border border-black shadow-lg hover:bg-gray-200 transition-all"
      >
        {isSubmitting ? "Processing..." : (editId ? "Update Ticket" : "Create Ticket")}
      </button>
    </form>
  </div>

  
</div>

  
          {/* Ticket List Section */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {tickets.length === 0 ? (
              <div className="text-center bg-gray-900 p-6 rounded-lg border border-white">
                <p className="text-gray-400">No tickets available. Create your first ticket!</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-white transform transition-all duration-300 "
                >
                  <div className="flex">
                    <div className="w-40 h-40 border-r border-white">
                      <img 
                        src={ticket.imageURL} 
                        alt={ticket.eventName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <h3 className="text-xl font-extrabold text-white">{ticket.eventName}</h3>
                      <p className="text-sm text-gray-400">{ticket.eventDate}</p>
                      <p className="text-sm text-gray-400 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {ticket.venue}
                    </p>
                    <p className="text-lg font-semibold text-white mt-2">₱{ticket.ticketPrice}</p>
                    <p className="text-sm text-gray-400">Total Tickets: {ticket.totalTickets}</p>
                    <div className="flex space-x-2 mt-4">
                      <button 
                        onClick={() => handleEdit(ticket)} 
                        className="bg-white text-black px-3 py-2 rounded-lg border border-black hover:bg-gray-600 "
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(ticket.id)} 
                        className="bg-black text-white px-3 py-2 rounded-lg border border-white hover:bg-gray-600 "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    <ToastContainer theme="dark" />
  </div>
);

                       
  

  
}

export default CreateTix;