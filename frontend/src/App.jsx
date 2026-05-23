import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/Home.jsx';
import Selection from './components/Selection.jsx';
import Scan_Product from './components/Scan_Product.jsx';
import Trolly_Product from './components/Trolly_Product.jsx';
import Payment from './components/Payment.jsx';
import Chatbot from './components/Chatbot.jsx';

const LanguageContext = createContext();

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem("preferredLanguage") || "en");
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
    fetchTranslations(language);
  }, [language]);

  const fetchTranslations = async (lang) => {
    try {
      const texts = {
        welcome: "Welcome to Dmart",
        provideInfo: "Please provide your information",
        name: "Enter your Name",
        phone: "Enter your Phone Number",
        language: "Choose your preferred language",
        submit: "Submit",
        selectionPage: "Select Your Items",
        scanProductPage: "Scan Your Products",
        paymentPage: "Proceed to Payment"
      };

      let translatedTexts = {};
      for (const key in texts) {
        const response = await axios.post("http://127.0.0.1:5000/api/translate", {
          text: texts[key],
          language: lang,
        });
        translatedTexts[key] = response.data.translated_text;
      }
      setTranslations(translatedTexts);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/selection" element={<Selection />} />
          <Route path="/scanProduct" element={<Scan_Product />} />
          <Route path="/trollyProduct" element={<Trolly_Product />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
        <Chatbot />
      </Router>
    </LanguageProvider>
  );
}

export { LanguageContext };
export default App;
