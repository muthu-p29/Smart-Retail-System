import React, { useEffect, useState } from "react";

const TrollyProduct = () => {
  const [products, setProducts] = useState({});
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState({ qr: false, object: false });

  // Function to fetch scanned product data
  const fetchProducts = async () => {
    try {
      const response = await fetch("/get_products");

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); // Auto-refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold bg-blue-500 text-white w-full text-center py-4">
        Smart Trolley System
      </h1>

      {/* Live Video Feeds */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {/* QR Code Scanner Feed */}
        <div className="bg-white border-2 border-gray-400 p-4 rounded-lg shadow-lg w-80">
          <h2 className="text-xl font-semibold mb-2">QR Code Scanner Feed</h2>
          {!cameraError.qr ? (
            <img
              src="/video_feed/1"
              alt="QR Scanner Feed"
              className="w-full rounded-md"
              onError={() => setCameraError({ ...cameraError, qr: true })}
            />
          ) : (
            <p className="text-red-600">QR Camera feed not available.</p>
          )}
        </div>

        {/* Object Detection Feed */}
        <div className="bg-white border-2 border-gray-400 p-4 rounded-lg shadow-lg w-80">
          <h2 className="text-xl font-semibold mb-2">Object Detection Feed</h2>
          {!cameraError.object ? (
            <img
              src="/video_feed/2"
              alt="Object Detection Feed"
              className="w-full rounded-md"
              onError={() => setCameraError({ ...cameraError, object: true })}
            />
          ) : (
            <p className="text-red-600">Object detection camera not available.</p>
          )}
        </div>
      </div>

      {/* Scanned Product List */}
      <div className="bg-white p-4 mt-6 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">Scanned Products</h2>
        {error && <p className="text-red-600">{error}</p>} {/* Show error message if any */}
        <ul className="text-left">
          {Object.keys(products).length === 0 ? (
            <p className="text-gray-500">No products detected yet.</p>
          ) : (
            Object.entries(products).map(([product, count]) => (
              <li key={product} className="py-1">
                <span className="font-medium">{product}</span>: {count}
              </li>
            ))
          )}
        </ul>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Refresh Product List
        </button>
      </div>
    </div>
  );
};

export default TrollyProduct;
