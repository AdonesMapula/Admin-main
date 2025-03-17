  import React, { useState, useEffect } from "react";
  import { Search, Plus, X, ChevronLeft, ChevronRight,Trash } from "lucide-react";
  import { db } from "../Firebase/firebase";
  import { collection, addDoc, getDocs, doc, updateDoc,deleteDoc } from "firebase/firestore";
  import axios from "axios";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { ToastContainer } from "react-toastify";


  function Emcee() {
    const [category, setCategory] = useState("All Emcee");
    const [sortBy, setSortBy] = useState("Name (A-Z)");
    const [filteredEmcees, setFilteredEmcees] = useState([]);
    const [emcees, setEmcees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const emceesPerPage = 8;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [newEmcee, setNewEmcee] = useState({
      name: "",
      hometown: "",
      reppin: "",
      image: "",
      background: "",
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmcee, setEditingEmcee] = useState(null);

    const openEditModal = (emcee) => {
      console.log("Editing Emcee:", emcee);
      setEditingEmcee(emcee);
      setIsEditModalOpen(true);
      console.log("isEditModalOpen after setting:", isEditModalOpen);
    };

    useEffect(() => {
      console.log("Edit modal state changed:", isEditModalOpen);
    }, [isEditModalOpen]);
    
    
    const deleteEmcee = async (id) => {
      if (!window.confirm("Are you sure you want to delete this emcee?")) return;
   
      try {
        await deleteDoc(doc(db, "emcees", id));
        setEmcees((prevEmcees) => prevEmcees.filter((emcee) => emcee.id !== id));
        toast.success("Emcee deleted successfully!");
      } catch (error) {
        console.error("Error deleting emcee:", error);
        toast.error("Failed to delete emcee.");
      }
   };
    
    
   const updateEmcee = async () => {
    if (!editingEmcee) return;
 
    try {
      let updatedImageUrl = editingEmcee.image;
 
      if (imageFile) {
        updatedImageUrl = await handleImageUpload();
        if (!updatedImageUrl) return;
      }
 
      const emceeRef = doc(db, "emcees", editingEmcee.id);
      await updateDoc(emceeRef, {
        name: editingEmcee.name,
        hometown: editingEmcee.hometown,
        reppin: editingEmcee.reppin,
        background: editingEmcee.background,
        image: updatedImageUrl,
      });
 
      setEmcees((prevEmcees) =>
        prevEmcees.map((emcee) =>
          emcee.id === editingEmcee.id ? { ...emcee, ...editingEmcee, image: updatedImageUrl } : emcee
        )
      );
 
      setIsEditModalOpen(false);
      setEditingEmcee(null);
      setImageFile(null);
      toast.success("Emcee updated successfully!");
    } catch (error) {
      console.error("Error updating emcee:", error);
      toast.error("Failed to update emcee.");
    }
 };
    

    useEffect(() => {
      filterAndSortEmcees();
    }, [category, sortBy, emcees]);

    const filterAndSortEmcees = () => {
      let updatedEmcees = [...emcees];

      // **Filter by Category**
      if (category !== "All Emcee") {
        updatedEmcees = updatedEmcees.filter((emcee) => emcee.category === category);
      }

      // **Sort by Name**
      if (sortBy === "Name (A-Z)") {
        updatedEmcees.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "Name (Z-A)") {
        updatedEmcees.sort((a, b) => b.name.localeCompare(a.name));
      }

      setFilteredEmcees(updatedEmcees);
    };


    useEffect(() => {
      fetchEmcees();
    }, []);

    const fetchEmcees = async () => {
      const querySnapshot = await getDocs(collection(db, "emcees"));
      const emceeList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmcees(emceeList);
    };

    const handleImageUpload = async () => {
      if (!imageFile) return null;
    
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "bshhhijy");
      formData.append("folder", "emcee_images");
    
      try {
        console.log("Uploading image...");
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dznhei4mc/image/upload",
          formData
        );
        console.log("Upload successful:", response.data.secure_url);
        return response.data.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error.response?.data || error);
        alert("Image upload failed. Check console for details.");
        return null;
      }
    };
    

    const addEmcee = async () => {
   try {
     const uploadedImageUrl = await handleImageUpload();
     if (!uploadedImageUrl) return;

     const newEmceeData = {
       ...newEmcee,
       image: uploadedImageUrl,
     };

     await addDoc(collection(db, "emcees"), newEmceeData);
     setEmcees([...emcees, newEmceeData]);
     setIsModalOpen(false);
     setNewEmcee({ name: "", hometown: "", reppin: "", image: null, background: "" });
     setImageFile(null);
     
     toast.success("Emcee added successfully!"); // Success toast
   } catch (error) {
     console.error("Error adding emcee:", error);
     toast.error("Failed to add emcee."); // Error toast
   }
};

    
    // Pagination logic
    const indexOfLastEmcee = currentPage * emceesPerPage;
    const indexOfFirstEmcee = indexOfLastEmcee - emceesPerPage;
    const currentEmcees = filteredEmcees.slice(indexOfFirstEmcee, indexOfLastEmcee);

    return (
      <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
          <ToastContainer theme="dark" /> 
        <div className="mb-10 border-b border-gray-800 pb-4"> 
            <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
              <span className="inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">EMCEES</span>
              MANAGEMENT
            </h1>
            <p className="text-gray-400 mt-2 italic">Rapollo Emcees </p>
          </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
          {/* Search */}
          <div className="relative w-1/3">
            <input type="text" placeholder="Search..." className="w-full bg-gray-900 text-white px-4 py-2 rounded-md focus:outline-none pr-10 border border-gray-700" />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-900 text-white px-4 py-2 rounded-md border border-gray-700" >
              <option value="All Emcee">All Emcee</option>
              <option value="Battle Rapper">Battle Rapper</option>
              <option value="Freestyle MC">Freestyle MC</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-900 text-white px-4 py-2 rounded-md border border-gray-700" >
              <option value="Name (A-Z)">Name (A-Z)</option>
              <option value="Name (Z-A)">Name (Z-A)</option>
            </select>
          </div>
          
          {/* Add Button */}
          <button onClick={() => setIsModalOpen(true)} className="bg-gray-800 px-6 py-2 rounded-md flex items-center gap-2 border border-gray-700 shadow-md hover:bg-gray-700 transition-all"> 
            <Plus size={16} /> Add Emcee 
          </button>
        </div>
  
        {/* Display Emcees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {currentEmcees.map((emcee, index) => (
          <div key={index} className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
            <img src={emcee.image} alt={emcee.name} className="w-full h-48 object-cover rounded-md" />
            <div className="p-4">
              <h2 className="font-bold text-2xl truncate">{emcee.name}</h2>
              <p className="text-gray-400 text-lg truncate">Hometown: <span className="text-white">{emcee.hometown}</span></p>
              <p className="text-gray-400 text-lg truncate">Reppin: <span className="text-white">{emcee.reppin}</span></p>
            </div>
            <div className="flex gap-2 mt-2">
            <button onClick={() => openEditModal(emcee)} className="bg-white text-black border-3 border-gray-600 px-4 py-2 rounded-md flex-1">
  Edit
</button>
<button onClick={() => deleteEmcee(emcee.id)} className="bg-black text-white px-4 py-2 rounded-md flex-1 flex items-center justify-center gap-1">
  <Trash size={16} /> Delete
</button>

            </div>
          </div>
        ))}
      </div>
       {/* Pagination Controls */}
<div className="flex justify-center mt-6">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    className="px-4 py-2 bg-gray-800 rounded-md mx-2 disabled:opacity-50"
    disabled={currentPage === 1}
  >
    <ChevronLeft size={20} />
  </button>
  <span className="text-white text-lg">Page {currentPage}</span>
  <button
    onClick={() =>
      setCurrentPage((prev) =>
        prev < Math.ceil(filteredEmcees.length / emceesPerPage) ? prev + 1 : prev
      )
    }
    className="px-4 py-2 bg-gray-800 rounded-md mx-2 disabled:opacity-50"
    disabled={currentPage === Math.ceil(filteredEmcees.length / emceesPerPage)}
  >
    <ChevronRight size={20} />
  </button>
</div>

  
        {/* Add Emcee Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Add Emcee</h2>
                  <button onClick={() => setIsModalOpen(false)}>
                    <X size={24} className="text-white" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  value={newEmcee.name}
                  onChange={(e) => setNewEmcee({ ...newEmcee, name: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
                />
                <input
                  type="text"
                  placeholder="Hometown"
                  value={newEmcee.hometown}
                  onChange={(e) => setNewEmcee({ ...newEmcee, hometown: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
                />
                <input
                  type="text"
                  placeholder="Reppin"
                  value={newEmcee.reppin}
                  onChange={(e) => setNewEmcee({ ...newEmcee, reppin: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
                />
                <textarea
                  placeholder="Background"
                  value={newEmcee.background}
                  onChange={(e) => setNewEmcee({ ...newEmcee, background: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
                />
                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
                />
                <button onClick={addEmcee} className="bg-gray-800 px-6 py-2 rounded-md w-full border border-gray-700 shadow-md hover:bg-gray-700 transition-all">
                  Add Emcee
                </button>
              </div>
            </div>
          )}
{/* Edit Emcee Modal */}
{isEditModalOpen && editingEmcee && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Edit Emcee</h2>
        <button onClick={() => setIsEditModalOpen(false)}>
          <X size={24} className="text-white" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Name"
        value={editingEmcee.name}
        onChange={(e) => setEditingEmcee({ ...editingEmcee, name: e.target.value })}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
      />
      <input
        type="text"
        placeholder="Hometown"
        value={editingEmcee.hometown}
        onChange={(e) => setEditingEmcee({ ...editingEmcee, hometown: e.target.value })}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
      />
      <input
        type="text"
        placeholder="Reppin"
        value={editingEmcee.reppin}
        onChange={(e) => setEditingEmcee({ ...editingEmcee, reppin: e.target.value })}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
      />
      <textarea
        placeholder="Background"
        value={editingEmcee.background}
        onChange={(e) => setEditingEmcee({ ...editingEmcee, background: e.target.value })}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
      />
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2 border border-gray-700"
      />
      <button
        onClick={updateEmcee}
        className="bg-gray-800 px-6 py-2 rounded-md w-full border border-gray-700 shadow-md hover:bg-gray-700 transition-all"
      >
        Update Emcee
      </button>
    </div>
  </div>
)}


      </div>
    );
  }
  
  

  export default Emcee;
