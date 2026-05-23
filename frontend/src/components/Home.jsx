import '../components/Home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'english'
  });
  const [translatedContent, setTranslatedContent] = useState({
    title: 'Welcome to Dmart',
    subtitle: 'Please provide your information',
    nameLabel: 'Enter your Name',
    phoneLabel: 'Enter your Phone Number',
    languageLabel: 'Choose your preferred language',
    submitButton: 'Submit'
  });

  // Language code mapping for Google Translate
  const languageCodes = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'hindi': 'hi',
    'tamil': 'ta'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Translate content when language changes
    translateContent(value);
  };

  const translateContent = async (targetLanguage) => {
    const targetLangCode = languageCodes[targetLanguage];
    
    if (!targetLangCode) return;

    try {
      // These are sample translations. In a real-world scenario, 
      // you would use the Google Translate API or a translation service
      const translations = {
        'en': {
          title: 'Welcome to Dmart',
          subtitle: 'Please provide your information',
          nameLabel: 'Enter your Name',
          phoneLabel: 'Enter your Phone Number',
          languageLabel: 'Choose your preferred language',
          submitButton: 'Submit'
        },
        'es': {
          title: 'Bienvenido a Dmart',
          subtitle: 'Por favor, proporcione su información',
          nameLabel: 'Ingrese su Nombre',
          phoneLabel: 'Ingrese su Número de Teléfono',
          languageLabel: 'Elija su idioma preferido',
          submitButton: 'Enviar'
        },
        'fr': {
          title: 'Bienvenue chez Dmart',
          subtitle: 'Veuillez fournir vos informations',
          nameLabel: 'Entrez votre Nom',
          phoneLabel: 'Entrez votre Numéro de Téléphone',
          languageLabel: 'Choisissez votre langue préférée',
          submitButton: 'Soumettre'
        },
        'hi': {
          title: 'Dmart में आपका स्वागत है',
          subtitle: 'कृपया अपनी जानकारी प्रदान करें',
          nameLabel: 'अपना नाम दर्ज करें',
          phoneLabel: 'अपना फोन नंबर दर्ज करें',
          languageLabel: 'अपनी पसंदीदा भाषा चुनें',
          submitButton: 'जमा करें'
        },
        'ta': {
          title: 'Dmart வரவேற்கிறது',
          subtitle: 'தயவுசெய்து உங்கள் தகவலைப் பெறுங்கள்',
          nameLabel: 'உங்கள் பெயரை உள்ளிடவும்',
          phoneLabel: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
          languageLabel: 'உங்கள் விருப்ப மொழியைத் தேர்வு செய்யுங்கள்',
          submitButton: 'சமர்ப்பிக்கவும்'
        }
      };

      // Set translated content
      setTranslatedContent(translations[targetLangCode]);
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to default content if translation fails
      setTranslatedContent({
        title: 'Welcome to Dmart',
        subtitle: 'Please provide your information',
        nameLabel: 'Enter your Name',
        phoneLabel: 'Enter your Phone Number',
        languageLabel: 'Choose your preferred language',
        submitButton: 'Submit'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/submit', formData);
      console.log(response.data);
      
      localStorage.setItem("userPhone", formData.phone);
      navigate('/selection');
    } catch (error) {
      console.error('Error saving data:', error);
      alert("Failed to save data. Please try again.");
    }
  };

  // Translate on initial render
  useEffect(() => {
    translateContent(formData.language);
  }, []);
  
  return (
    <div className="Home_Page">
      <div className='home_title'>
        <h1 className="title">{translatedContent.title}</h1>
      </div>
      
      <div className="home_content">
        <h2>{translatedContent.subtitle}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form_group">
            <label htmlFor="name">{translatedContent.nameLabel}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form_group">
            <label htmlFor="phone">{translatedContent.phoneLabel}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form_group">
            <label htmlFor="language">{translatedContent.languageLabel}</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="hindi">Hindi</option>
              <option value="tamil">Tamil</option>
            </select>
          </div>
          
          <button type="submit" className="submit_btn">
            {translatedContent.submitButton}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;