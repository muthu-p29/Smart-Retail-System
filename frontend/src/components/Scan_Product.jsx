import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/Scan_Product.css";

export default function QRScannerApp() {
  const [qrData, setQrData] = useState("");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [language, setLanguage] = useState("english");
  const [translatedContent, setTranslatedContent] = useState({
    title: "QR Scanner App",
    toggleCameraOn: "Turn Off Camera",
    toggleCameraOff: "Turn On Camera",
    phoneInputPlaceholder: "Enter Phone Number",
    scannedQRLabel: "Scanned QR:",
    scannedProductsTitle: "Scanned Products:",
    chooseLanguage: "Choose Language",
    noProductsMessage: "No products scanned yet",
    checkoutButtonText: "Checkout",
    deleteButtonText: "Delete",
    totalAmountLabel: "Total",
  });

  const navigate = useNavigate();

  const languageCodes = {
    english: "en",
    spanish: "es",
    french: "fr",
    hindi: "hi",
    tamil: "ta",
  };

  const translateContent = (targetLanguage) => {
    const translations = {
      en: { ...translatedContent },
      es: {
        title: "Aplicación de Escáner QR",
        toggleCameraOn: "Apagar Cámara",
        toggleCameraOff: "Encender Cámara",
        phoneInputPlaceholder: "Ingrese su Número de Teléfono",
        scannedQRLabel: "QR Escaneado:",
        scannedProductsTitle: "Productos Escaneados:",
        chooseLanguage: "Elegir Idioma",
        noProductsMessage: "Aún no hay productos escaneados",
        checkoutButtonText: "Pagar",
        deleteButtonText: "Eliminar",
        totalAmountLabel: "Total",
      },
      fr: {
        title: "Application de Scanneur QR",
        toggleCameraOn: "Éteindre la Caméra",
        toggleCameraOff: "Allumer la Caméra",
        phoneInputPlaceholder: "Entrez votre Numéro de Téléphone",
        scannedQRLabel: "QR Scanné:",
        scannedProductsTitle: "Produits Scannés:",
        chooseLanguage: "Choisir la Langue",
        noProductsMessage: "Aucun produit scanné",
        checkoutButtonText: "Paiement",
        deleteButtonText: "Supprimer",
        totalAmountLabel: "Total",
      },
      hi: {
        title: "QR स्कैनर ऐप",
        toggleCameraOn: "कैमरा बंद करें",
        toggleCameraOff: "कैमरा चालू करें",
        phoneInputPlaceholder: "फोन नंबर दर्ज करें",
        scannedQRLabel: "स्कैन किया गया QR:",
        scannedProductsTitle: "स्कैन किए गए उत्पाद:",
        chooseLanguage: "भाषा चुनें",
        noProductsMessage: "अभी तक कोई उत्पाद स्कैन नहीं हुआ",
        checkoutButtonText: "चेकआउट",
        deleteButtonText: "हटाएं",
        totalAmountLabel: "कुल",
      },
      ta: {
        title: "QR ஸ்கேனர் பயன்பாடு",
        toggleCameraOn: "கேமரா நிறுத்து",
        toggleCameraOff: "கேமரா தொடங்கு",
        phoneInputPlaceholder: "தொலைபேசி எண் உள்ளிடவும்",
        scannedQRLabel: "ஸ்கேன் செய்யப்பட்ட QR:",
        scannedProductsTitle: "ஸ்கேன் செய்யப்பட்ட தயாரிப்புகள்:",
        chooseLanguage: "மொழி தேர்வு",
        noProductsMessage: "தயாரிப்புகள் இல்லை",
        checkoutButtonText: "செக் அவுட்",
        deleteButtonText: "நீக்கு",
        totalAmountLabel: "மொத்தம்",
      },
    };
    setTranslatedContent(translations[languageCodes[targetLanguage]] || translations.en);
  };

  const fetchQRData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get_qr_data");
      if (response.data.qr_data && response.data.qr_data !== qrData) {
        setQrData(response.data.qr_data);
      }
    } catch (error) {
      console.error("Error fetching QR data", error);
    }
  };

  const submitQRProduct = async () => {
    if (!qrData || !phone) return;

    // Parse QR data (example: Product: Haman Soap Price: 70 Rs Quantity: 2)
    const regex = /Product:\s*(.*?)\s*Price:\s*(\d+)\s*Rs\s*Quantity:\s*(\d+)/i;
    const match = qrData.match(regex);

    if (!match) {
      console.error("QR Data format incorrect:", qrData);
      return;
    }

    const name = match[1];
    const price = parseFloat(match[2]);
    const quantity = parseInt(match[3]);
    const totalPrice = price * quantity;

    try {
      const response = await axios.post("http://localhost:5000/api/submit_qr_product", {
        phone,
        product: name,
        price: totalPrice,
        quantity: quantity,
      });

      setMessage(response.data.message || "Product added successfully");
      fetchCustomerProducts();
      
      // Clear the QR data after successful submission
      setQrData("");
    } catch (error) {
      console.error("Error submitting product", error);
    }
  };

  const fetchCustomerProducts = async () => {
    if (!phone) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/get_customer_items?phone=${phone}`);
      setProducts(response.data.scanned_products || []);
    } catch (error) {
      console.error("Error fetching customer products", error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!phone) return;

    try {
      const response = await axios.delete("http://localhost:5000/api/delete_product", {
        data: { phone, product_id: productId },
      });

      if (response.data.success) {
        fetchCustomerProducts();
        setMessage(response.data.message || "Product deleted successfully");
      } else {
        setMessage(response.data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  const toggleCamera = async () => {
    try {
      if (cameraOn) {
        await axios.post("http://localhost:5000/stop_camera");
        setCameraOn(false);
      } else {
        await axios.post("http://localhost:5000/start_camera");
        setCameraOn(true);
      }
    } catch (error) {
      console.error("Error toggling camera", error);
      setCameraOn(!cameraOn);
    }
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      const quantity = product.quantity || 1;
      const price = product.price || 0;
      return sum + price;
    }, 0);
  };

  const goToCheckout = () => {
    // Store data in localStorage as a backup
    localStorage.setItem("phoneNumber", phone);
    localStorage.setItem("language", language);
    
    // Navigate to payment page with state
    navigate("/payment", { 
      state: { 
        phone, 
        products, 
        language 
      } 
    });
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    translateContent(languageCodes[selectedLanguage]);
    localStorage.setItem("language", selectedLanguage);
  };

  useEffect(() => {
    // Load stored values from localStorage
    const storedPhone = localStorage.getItem("phoneNumber");
    const storedLanguage = localStorage.getItem("language");
    
    if (storedPhone) {
      setPhone(storedPhone);
    }
    
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    
    translateContent(languageCodes[storedLanguage] || "en");
  }, []);

  useEffect(() => {
    if (qrData && phone) {
      submitQRProduct();
    }
  }, [qrData]);

  useEffect(() => {
    if (phone) {
      fetchCustomerProducts();
    }
  }, [phone]);

  useEffect(() => {
    let interval;
    if (cameraOn) {
      fetchQRData();
      interval = setInterval(fetchQRData, 3000);
    }
    return () => interval && clearInterval(interval);
  }, [cameraOn]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{translatedContent.title}</h1>
        <div className="flex items-center">
          <label className="mr-2 text-sm">{translatedContent.chooseLanguage}:</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="border p-1 rounded text-sm"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
          </select>
        </div>
      </div>

      <button
        onClick={toggleCamera}
        className="bg-red-500 text-white p-2 w-full rounded mb-4"
      >
        {cameraOn ? translatedContent.toggleCameraOn : translatedContent.toggleCameraOff}
      </button>

      {cameraOn && (
        <img
          src="http://localhost:5000/video_feed"
          alt="QR Scanner"
          className="border rounded w-full h-64 object-cover mb-4"
        />
      )}

      <input
        type="text"
        placeholder={translatedContent.phoneInputPlaceholder}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {qrData && (
        <p className="mb-2">
          {translatedContent.scannedQRLabel} <strong>{qrData}</strong>
        </p>
      )}
      {message && <p className="mt-2 text-green-600">{message}</p>}

      <div className="products-container">
        <h2 className="products-title">{translatedContent.scannedProductsTitle}</h2>

        {products.length > 0 ? (
          <>
            <ul className="products-list">
              {products.map((product, index) => (
                <li key={index} className="product-item flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.location}</div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">${product.price || 0}</span>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="delete-button bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      {translatedContent.deleteButtonText}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="total-amount text-right font-bold mt-4">
              {translatedContent.totalAmountLabel}: ${calculateTotal()}
            </div>

            <button
              onClick={goToCheckout}
              className="checkout-button bg-green-600 text-white w-full p-2 rounded mt-4"
              disabled={products.length === 0}
            >
              {translatedContent.checkoutButtonText}
            </button>
          </>
        ) : (
          <div className="product-empty text-center mt-4">
            {translatedContent.noProductsMessage}
          </div>
        )}
      </div>
    </div>
  );
}