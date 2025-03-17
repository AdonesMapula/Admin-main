import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";

function Shop() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

const handlePageChange = (newPage) => {
  if (newPage > 0 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};

  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    image: "",
    sizes: [],
  });

  const sizeOptions = ["All", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const categoryOptions = ["T-Shirts", "Jackets", "Hoodies", "Cap", "Accessories", "Others"];
  const brandOptions = [
    "Atraxia",
    "BLVCK MNL",
    "FlipTop",
    "Rapollo",
    "RealJokes",
    "Uprising",
    "City Boy Outfitters",
    "Ninetynine Clothing",
    "Got Bars",
    "Hypebeat",
    "Turbohectic",
    "Rx Panda",
    "Low Qual",
    "Payaso",
    "Greedy Bastard",
    "Rebel Doggs Merch",
    "Krwn Manila",
    "Others"
  ];
  
  const handleDropdownChange = (field, value) => {
    setProductData((prevData) => ({
      ...prevData,
      [field]: value, 
    }));
  };  

  const [selectedSizes, setSelectedSizes] = useState([]);

  const toggleSize = (size) => {
    setSelectedSizes((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size) 
        : [...prevSizes, size] 
    );
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSizeSelection = (size) => {
    setProductData((prevData) => {
      let updatedSizes;
      if (size === "All") {
        updatedSizes = prevData.sizes.includes("All") ? [] : sizeOptions.slice(1);
      } else {
        updatedSizes = prevData.sizes.includes(size)
          ? prevData.sizes.filter((s) => s !== size)
          : [...prevData.sizes, size];
      }
      return { ...prevData, sizes: updatedSizes };
    });
  };

  const handleSubmit = async () => {
    try {
      let uploadedImageUrls = [];

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "bshhhijy");
          formData.append("folder", "shop_products");

          const response = await axios.post(
            "https://api.cloudinary.com/v1_1/dznhei4mc/image/upload",
            formData
          );
          return response.data.secure_url;
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      const newProductData = {
        ...productData,
        image: uploadedImageUrls.length > 0 ? uploadedImageUrls : productData.image,
      };

      if (selectedProduct) {
        const productRef = doc(db, "products", selectedProduct.id);
        await updateDoc(productRef, newProductData);
      } else {
        await addDoc(collection(db, "products"), newProductData);
      }

      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setProductData({ name: "", brand: "", category: "", price: "", image: "", sizes: [] });
      setImageFile(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setProductData({ name: "", brand: "", category: "", price: "", image: "", sizes: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductData({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price || "",
      image: product.image || "",
      sizes: product.sizes || [],
    });
    setIsEditModalOpen(true);
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    } catch (error) {
      console.error("Error removing product:", error);
      alert("Failed to remove product.");
    }
  };
  

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6 ml-64">
      <div className="w-full flex justify-between items-center mb-6">
      <div className="mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <span className="flex inline-block transform -skew-x-12 bg-white text-black px-3 py-1 mr-3">PRODUCT</span>
            MANAGEMENT
          </h1>
          <p className="text-gray-400 mt-2 italic">Rapollo Products </p>
        </div>
        <button onClick={openAddModal} className="bg-gray-500 px-4 py-2 rounded-md font-semibold">
          Add Product
        </button>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-15">
      {currentProducts.length > 0 ? (
        currentProducts.map((product) => (
          <div key={product.id} className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <img src={Array.isArray(product.image) ? product.image[0] : product.image} alt={product.name} className="w-full h-[250px] object-cover rounded-md" />
            <h2 className="mt-3 font-bold text-xl">{product.name}</h2>
            <p className="text-gray-400">{product.category} - {product.brand}</p>
            <p className="text-white text-lg font-semibold">₱{product.price}</p>
            <p className="text-white text-md">Sizes:{" "}<span className="font-bold">
                {product.sizes ?.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)).join(", ") || "None"}
              </span>
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <button onClick={() => openEditModal(product)} className="bg-white text-black px-3 py-1 rounded-md">
                Edit
              </button>
              <button onClick={() => removeProduct(product.id)}
                className="bg-black text-white px-3 py-1 rounded-md">
                Remove
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No products available.</p>
      )}

      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-700 px-4 py-2 mx-2 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-700 px-4 py-2 mx-2 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }}>✖</button>
            </div>

            <input 
              type="text" 
              placeholder="Name" 
              value={productData.name} 
              onChange={(e) => setProductData({ ...productData, name: e.target.value })} 
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2" 
            />

            <select 
              value={brandOptions.includes(productData.brand) ? productData.brand : "Others"}
              onChange={(e) => handleDropdownChange("brand", e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2"
            >
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select 
              value={categoryOptions.includes(productData.category) ? productData.category : "Others"}
              onChange={(e) => handleDropdownChange("category", e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <input 
              type="number" 
              placeholder="Price" 
              value={productData.price} 
              onChange={(e) => setProductData({ ...productData, price: e.target.value })} 
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2" 
            />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md mb-2"
            />

            <div className="mb-4">
              <label className="text-white font-bold">Available Sizes:</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {sizeOptions.map((size) => (
                  <div
                    key={size}
                    className={`cursor-pointer px-3 py-1 rounded-md text-center font-bold ${
                      productData.sizes.includes(size) ? "bg-green-500 text-black" : "bg-red-500 text-white"
                    }`}
                    onClick={() => handleSizeSelection(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} className="bg-red-500 px-6 py-2 rounded-md w-full font-semibold">
              {selectedProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
