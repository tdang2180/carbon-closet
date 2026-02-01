'use client'
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";

export default function Donate() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    item: "",
    size: "",
    gender: "",
    image: null,
  });
  const [priceResult, setPriceResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!user) {
      setErrorMessage("You must be logged in to donate items");
      setIsUploading(false);
      return;
    }
    
    try {
      // Call the Cloud Function to get the price
      const functions = getFunctions();
      const getPrice = httpsCallable(functions, 'getPrice');
      
      const priceResult = await getPrice({ query: formData.item });
      const priceData = priceResult.data;
      
      if (!priceData.average_price) {
        setPriceResult(null);
        throw new Error("Could not determine price for this item");
      }
      
      setPriceResult(priceData.average_price);

      // Now handle image upload and create listing
      if (formData.image) {
        const storage = getStorage();
        const fileName = `${Date.now()}_${formData.image.name}`;
        const storageRef = ref(storage, `clothing_images/${fileName}`);
        
        // Upload the image
        const uploadSnapshot = await uploadBytes(storageRef, formData.image);
        const imageUrl = await getDownloadURL(uploadSnapshot.ref);
        
        // Create listing in Firestore
        const listingsRef = collection(db, 'listings');
        const listingDoc = await addDoc(listingsRef, {
          item: formData.item,
          size: formData.size,
          gender: formData.gender,
          price: priceData.average_price,
          imageUrl: imageUrl,
          userId: user.uid,
          userEmail: user.email,
          createdAt: serverTimestamp()
        });
        
        console.log("Item listed successfully:", listingDoc.id);
        
        setSuccessMessage("Your item has been successfully donated!");
        
        // Reset form after successful upload
        setFormData({
          item: "",
          size: "",
          gender: "",
          image: null,
        });
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.message || "Error submitting donation. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20">
      <h1 className="text-2xl font-bold mb-8">Donate Clothes</h1>
      
      {successMessage && (
        <div className="w-full max-w-md mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="w-full max-w-md mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {errorMessage}
        </div>
      )}
      
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-md bg-white p-6 rounded-lg shadow-md"
      >
        {/* Clothing Item Input */}
        <div className="flex flex-col">
          <label htmlFor="item_name" className="mb-1 text-sm font-medium text-gray-700">Item</label>
          <input
            id="item_name"
            name="item"
            type="text"
            value={formData.item || ""}
            onChange={handleInputChange}
            placeholder="E.g Men's 501 Levis"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Size Selection */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium mb-2">
            Clothing Size
          </label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          >
            <option value="" disabled>
              Select size
            </option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        {/* Gender Input */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium mb-2">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-2">
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
          {previewUrl && (
            <div className="mt-2">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-md" 
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit"}
        </button>
        
        {/* Display price result */}
        {priceResult !== null && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-center font-medium">
              Average price: ${priceResult}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}