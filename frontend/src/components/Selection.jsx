import React, { useState, createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/Selection.css';

// Translations Object
const translationsData = {
  english: {
    "Choose Shopping Method": "Choose Shopping Method",
    "Self Basis": "Self Basis",
    "Trolley Shopping": "Trolley Shopping",
    "Shop on your own with a handheld scanner": "Shop on your own with a handheld scanner",
    "Shop with a smart trolley for larger purchases": "Shop with a smart trolley for larger purchases",
    "Back": "Back",
    "Continue": "Continue",
    "Choose Language": "Choose Language"
  },
  spanish: {
    "Choose Shopping Method": "Elige Método de Compra",
    "Self Basis": "Compra Individual",
    "Trolley Shopping": "Compra con Carrito",
    "Shop on your own with a handheld scanner": "Compra por tu cuenta con un escáner manual",
    "Shop with a smart trolley for larger purchases": "Compra con un carrito inteligente para compras más grandes",
    "Back": "Atrás",
    "Continue": "Continuar",
    "Choose Language": "Elegir Idioma"
  },
  french: {
    "Choose Shopping Method": "Choisissez la Méthode d'Achat",
    "Self Basis": "Achat Individuel",
    "Trolley Shopping": "Achat avec Chariot",
    "Shop on your own with a handheld scanner": "Achetez par vous-même avec un scanner portable",
    "Shop with a smart trolley for larger purchases": "Achetez avec un chariot intelligent pour les achats plus importants",
    "Back": "Retour",
    "Continue": "Continuer",
    "Choose Language": "Choisir la Langue"
  },
  hindi: {
    "Choose Shopping Method": "खरीदारी की विधि चुनें",
    "Self Basis": "स्वयं आधार",
    "Trolley Shopping": "ट्रॉली खरीदारी",
    "Shop on your own with a handheld scanner": "हैंडहेल्ड स्कैनर के साथ स्वयं खरीदारी करें",
    "Shop with a smart trolley for larger purchases": "बड़ी खरीदारी के लिए स्मार्ट ट्रॉली के साथ खरीदारी करें",
    "Back": "वापस",
    "Continue": "जारी रखें",
    "Choose Language": "भाषा चुनें"
  },
  tamil: {
    "Choose Shopping Method": "வாங்கும் முறையைத் தேர்ந்தெடுங்கள்",
    "Self Basis": "சொந்த அடிப்படை",
    "Trolley Shopping": "ட்ரொலி வாங்கல்",
    "Shop on your own with a handheld scanner": "கைப்பிடி வருடிக் கொண்டு சொந்தமாக வாங்குங்கள்",
    "Shop with a smart trolley for larger purchases": "பெரிய வாங்கல்களுக்கு ஸ்மார்ட் ட்ரொலியுடன் வாங்குங்கள்",
    "Back": "பின்செல்",
    "Continue": "தொடரவும்",
    "Choose Language": "மொழி தேர்வு"
  }
};

// Create LanguageContext
const LanguageContext = createContext();

function Selection() {
  const [language, setLanguage] = useState('english');
  const [translations, setTranslations] = useState(translationsData.english);
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState('');

  // Language options for dropdown
  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' }
  ];

  useEffect(() => {
    const storedPhone = localStorage.getItem("userPhone");
    if (storedPhone) {
      setPhone(storedPhone);
    }
  }, []);

  const handleMethodSelect = async (method) => {
    setSelectedMethod(method);
    console.log(`Selected method: ${method}`);

    if (phone) {
      try {
        console.log("Sending data to backend:", { phone, method });
        const response = await axios.post('http://127.0.0.1:5000/api/update-method', {
          phone: phone,
          method: method
        });

        console.log("Response from backend:", response.data);
      } catch (error) {
        console.error("Error updating shopping method:", error.response ? error.response.data : error);
      }
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setTranslations(translationsData[selectedLanguage]);
  };

  return (
    <LanguageContext.Provider value={{ translations, language, setLanguage }}>
      <div className="selection_container">
        <div className="header_container flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" >
            {translations["Choose Shopping Method"] || "Choose Shopping Method"}
          </h1>
          
          <div className="language_selector flex items-center">
            <label className="mr-2 text-sm">
              {translations["Choose Language"] || "Choose Language"}:
            </label>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="border p-1 rounded text-sm"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="content">
          <div 
            className={`method_option ${selectedMethod === 'self' ? 'selected' : ''}`}
            onClick={() => handleMethodSelect('self')}
          >
            <div className="icon_container">
              <i className="method_icon">🛒</i>
            </div>
            <h2>{translations["Self Basis"] || "Self Basis"}</h2>
            <p>{translations["Shop on your own with a handheld scanner"] || "Shop on your own with a handheld scanner"}</p>
          </div>

          <div 
            className={`method_option ${selectedMethod === 'trolly' ? 'selected' : ''}`} 
            onClick={() => handleMethodSelect('trolly')}
          >
            <div className="icon_container">
              <i className="method_icon">🛒</i>
            </div>
            <h2>{translations["Trolley Shopping"] || "Trolley Shopping"}</h2>
            <p>{translations["Shop with a smart trolley for larger purchases"] || "Shop with a smart trolley for larger purchases"}</p>
          </div>
        </div>

        <div className="Back">
          <button 
            className="back_button" 
            onClick={() => navigate('/')}
          >
            {translations["Back"] || "Back"}
          </button>
        </div>

        {selectedMethod && (
          <button 
            className="continue_button"
            onClick={() => {
              if (selectedMethod === 'self') {
                navigate('/scanProduct');
              } else if (selectedMethod === 'trolly') {
                navigate('/trollyProduct');
              }
            }}
          >
            {translations["Continue"] || "Continue"}
          </button>
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default Selection;