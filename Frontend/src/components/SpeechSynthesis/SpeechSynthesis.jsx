import React, { useState } from "react";
import "./SpeechSynthesis.css";

const SpeechSynthesis = ({ onSearchResult, onInterimResult }) => {
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interim += text;
        }
      }
      
      if (finalText) {
        if (onSearchResult) {
          onSearchResult(finalText.trim());
        }
      } else if (interim) {
        if (onInterimResult) {
          onInterimResult(interim);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      const errorMessages = {
        "network": "Network error. Check internet and microphone permissions.",
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone not found or not permitted.",
        "not-allowed": "Microphone permission denied. Please allow microphone access.",
        "service-not-allowed": "Speech recognition service not allowed."
      };
      
      const message = errorMessages[event.error] || `Error: ${event.error}`;
      alert(message);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Error starting recognition:", err);
      setIsListening(false);
      alert("Could not start speech recognition. Please check browser settings.");
    }
  };

  return (
    <button
      className={`mic-btn ${isListening ? "listening" : ""}`}
      onClick={startListening}
      disabled={isListening}
      aria-label="Voice Search"
      title={isListening ? "Listening..." : "Click to search by voice"}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M49.1465 24.0811C50.1389 26.3959 50.2665 28.8224 49.5186 31.1729C48.7705 33.5234 47.1672 35.7354 44.833 37.6367C42.4987 39.5381 39.4956 41.0787 36.0566 42.1387C32.9171 43.1064 29.4904 43.648 26 43.7354V50H24V43.7354C20.5092 43.6481 17.0823 43.1065 13.9424 42.1387C10.5032 41.0786 7.50037 39.5381 5.16602 37.6367C2.83167 35.7353 1.22856 33.5235 0.480469 31.1729C-0.267498 28.8224 -0.140793 26.3959 0.851562 24.0811L11.4482 25.8555C10.8913 27.1546 10.8204 28.5168 11.2402 29.8359C11.6601 31.1548 12.5594 32.396 13.8691 33.4629C15.1791 34.5299 16.865 35.3944 18.7949 35.9893C20.7247 36.584 22.8474 36.8935 24.999 36.8936C27.1508 36.8936 29.2742 36.5841 31.2041 35.9893C33.1339 35.3944 34.819 34.5298 36.1289 33.4629C37.4388 32.396 38.3389 31.1549 38.7588 29.8359C39.1786 28.5168 39.1067 27.1546 38.5498 25.8555L49.1465 24.0811ZM25 0C29.0892 0.000140825 32.7196 2.45505 35 6.25H25V12.5H37.249C37.413 13.5097 37.499 14.5548 37.499 15.625C37.499 16.6952 37.413 17.7403 37.249 18.75H25V25H35C32.7196 28.7949 29.0892 31.2499 25 31.25C18.0966 31.25 12.5 24.2544 12.5 15.625C12.5 6.99557 18.0966 0 25 0Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export default SpeechSynthesis;
