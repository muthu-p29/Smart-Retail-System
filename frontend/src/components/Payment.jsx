import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import uniqid from "uniqid";
import { Base64 } from "js-base64";
import sha256 from "crypto-js/sha256";
import { QRCode } from "react-qrcode-logo"; 
import "./Payment.css";

const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = 1;
const MERCHANT_ID = "PGTESTPAYUAT86";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [products, setProducts] = useState([]);
  const [language, setLanguage] = useState("english");
  const [showQRCode, setShowQRCode] = useState(false);

  const calculateTotalAmount = (products) => {
    return products.reduce((sum, product) => sum + (product.price || 0), 0);
  };

  const getOrderDetailsText = () => {
    let text = "Order Details:\n";
    products.forEach((product, index) => {
      text += `${index + 1}. ${product.name} x ${product.quantity || 1} = $${product.price || 0}\n`;
    });
    text += `Total: $${calculateTotalAmount(products)}`;
    return text;
  };

  const handlePayment = async () => {
    if (!phoneNumber || products.length === 0) {
      setError("Phone number and products are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const totalAmount = calculateTotalAmount(products);
      const amountInPaise = totalAmount * 100;
      const merchantTransactionId = uniqid();

      const normalPayload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: phoneNumber,
        amount: amountInPaise,
        redirectMode: "REDIRECT",
        mobileNumber: phoneNumber,
        paymentInstrument: { type: "PAY_PAGE" },
      };

      const base64EncodedPayload = Base64.encode(JSON.stringify(normalPayload));
      const stringToHash = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
      const sha256Hash = sha256(stringToHash).toString();
      const xVerifyChecksum = `${sha256Hash}###${SALT_INDEX}`;

      const response = await axios.post(
        "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
        { request: base64EncodedPayload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
          },
        }
      );

      if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
        const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

        // Save to localStorage
        localStorage.setItem("phoneNumber", phoneNumber);
        localStorage.setItem("products", JSON.stringify(products));
        localStorage.setItem("showQR", "true");

        // Send order details to your number
        await axios.post('http://localhost:5000/send-sms', {
          message: getOrderDetailsText(),
        });

        window.location.href = redirectUrl;
      } else {
        setError("Invalid response from payment gateway");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError("Payment initiation failed: " + (error.message || "Unknown error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const showQR = localStorage.getItem("showQR");

    if (showQR === "true") {
      const storedPhone = localStorage.getItem("phoneNumber");
      const storedProducts = localStorage.getItem("products");

      if (storedPhone) setPhoneNumber(storedPhone);
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      setShowQRCode(true);

      // Clear after showing once
      localStorage.removeItem("showQR");
      localStorage.removeItem("phoneNumber");
      localStorage.removeItem("products");
    } else {
      const state = location.state || {};
      if (state.phone) {
        setPhoneNumber(state.phone);
      }
      if (state.products && state.products.length > 0) {
        setProducts(state.products);
      }
      if (state.language) {
        setLanguage(state.language);
      }
    }
  }, [location]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1 className="payment-title">Payment</h1>
        <div className="language-selector">
          <label className="language-label">Language:</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
          </select>
        </div>
      </div>

      {showQRCode && (
        <div className="qr-code-container">
          <h3>Thanks for Shopping!</h3>
          <QRCode value={getOrderDetailsText()} size={256} />
        </div>
      )}

      {!showQRCode && (
        <div className="order-summary-card">
          <h2 className="order-summary-title">Order Summary</h2>

          {products.length > 0 ? (
            <>
              <div className="product-grid-header">
                <div>Product</div>
                <div className="product-quantity">Quantity</div>
                <div className="product-price">Price</div>
              </div>

              {products.map((product, index) => (
                <div key={index} className="product-grid-item">
                  <div className="product-name">{product.name}</div>
                  <div className="product-quantity">{product.quantity || 1}</div>
                  <div className="product-price">${product.price || 0}</div>
                </div>
              ))}

              <div className="order-total">
                Total Amount: ${calculateTotalAmount(products)}
              </div>
            </>
          ) : (
            <p className="no-products-message">No products to pay for</p>
          )}
        </div>
      )}

      {!showQRCode && (
        <>
          <div className="input-group">
            <label className="input-label">Phone Number:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="phone-input"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-container">
            <button
              onClick={handleBack}
              className="button back-button"
              disabled={loading}
            >
              Back to Scanner
            </button>

            <button
              onClick={handlePayment}
              className={`button payment-button ${loading ? "loading-button-text" : ""}`}
              disabled={loading || products.length === 0}
            >
              {loading ? "Processing payment..." : "Pay Now"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
