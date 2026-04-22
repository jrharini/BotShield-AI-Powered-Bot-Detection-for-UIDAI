import React, { useEffect, useState, useRef } from "react";

// Utility function for SHA-256 Hashing
async function sha256(str) {
  const buf = new TextEncoder("utf-8").encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // 🛠️ FIXED: Changed Uint8array to Uint8Array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export default function UidaibotDetectionSystem() {
  const [tab, setTab] = useState("demo");
  const [aadhaar, setAadhaar] = useState("");
  const [notification, setNotification] = useState({ text: "", type: "" });
  // *** CHANGE MADE HERE: Initializing activeFAQ to null so no answer is shown by default ***
  const [activeFAQ, setActiveFAQ] = useState(null); // State to manage open FAQ item

  const [env, setEnv] = useState({
    screenWidth: "",
    screenHeight: "",
    timezone: "",
    connection: "",
    platform: "",
    language: "",
    memory: "",
    browser: "",
    gpu: "",
    touchSupport: "",
    webdriver: "",
    battery: "",
    hardwareConcurrency: "",
    timezoneMismatch: "",

    // NEW FIELD - Renamed to Hash for clarity, but kept original for compatibility
    canvasFingerprint: "",
    fontsHash: "",
    webglVendor: "",
  });

  const [metrics, setMetrics] = useState({
    mouseMoves: 0,
    scrollEvents: 0,
    keyboardEvents: 0,
    clicks: 0,
    timeOnPage: 0,
    pathVariance: 0,
    idleTime: 0,
    focusChanges: 0,
    typingSpeedVariance: 0,

    avgMouseSpeed: 0,
    maxMouseSpeed: 0,
    mouseJitter: 0,
    directionChanges: 0,
    straightness: 0,

    avgKeyInterval: 0,
    burstTypingRatio: 0,
    pauseVariance: 0,

    scrollVelocity: 0,
    scrollAcceleration: 0,
    scrollJitter: 0,
  });

  // FAQ Data Structure
  const faqItems = [
    {
      question: "Why is there no CAPTCHA?",
      answer: "Traditional CAPTCHAs interrupt user flow and reduce accessibility. UIDAI uses passive AI-based analysis to ensure security without affecting usability.",
    },
    {
      question: "Is my Aadhaar number safe?",
      answer: "Yes. Aadhaar numbers are securely transmitted and are never stored or exposed.",
    },
    {
      question: "What happens if suspicious activity is detected?",
      answer: "If passive analysis cannot confidently verify a request, the system may request one minimal interaction to confirm human presence.",
    },
    {
      question: "Does this affect genuine users?",
      answer: "No. Genuine users experience a seamless and frictionless process.",
    },
  ];

  const handleFAQToggle = (question) => {
    setActiveFAQ(activeFAQ === question ? null : question);
  };
  const mouseSpeedsRef = useRef([]);
  const lastMouseRef = useRef({ x: null, y: null, time: null });
  const prevAngleRef = useRef(null);
  const startPointRef = useRef(null);
  const totalDistanceRef = useRef(0);
  const directionChangesRef = useRef(0);


  const startMouseRef = useRef({ x: null, y: null });
  const lastScrollPositionRef = useRef(0);
  const lastScrollVelocityRef = useRef(0);
  const lastScrollAccelerationRef = useRef(0);

  useEffect(() => {
    const initializeEnv = async () => { // Changed useEffect callback to an async function

      // WEBGL DETAILS
      const gl = document.createElement("canvas").getContext("webgl");
      let gpuInfo = "Unknown GPU";
      let webglVendor = "Unknown Vendor";

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        }
      }

      // CANVAS FINGERPRINT - Gets raw Base64 string
      const getCanvasFingerprint = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#f60";
        ctx.fillText("Fingerprint Test 123", 2, 2);

        return btoa(canvas.toDataURL());
      };

      // FONTS HASH
      const detectFontsHash = () => {
        const fonts = [
          "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
          "Roboto", "Inter", "Calibri", "Cambria", "Tahoma"
        ];

        const testString = "mmmmmmmmmmlli";
        const base = document.createElement("span");
        base.style.fontSize = "48px";
        base.innerHTML = testString;

        const hashes = [];

        fonts.forEach(font => {
          const span = base.cloneNode(true);
          span.style.fontFamily = font;
          document.body.appendChild(span);
          hashes.push(span.offsetWidth + "-" + span.offsetHeight);
          document.body.removeChild(span);
        });

        return btoa(hashes.join("|"));
      };

      // TIMEZONE
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timezoneMismatch = timezone !== "Asia/Kolkata" ? "Yes" : "No";

      // 🌟 NEW: Compute the SHA-256 hash of the canvas data URL
      const rawCanvasData = getCanvasFingerprint();
      const canvasHash = await sha256(rawCanvasData); // Await the async hash function

      const fontsHash = detectFontsHash();

      const setFullEnv = (batteryLevel = "Unknown") => {
        setEnv({
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timezone: timezone,
          connection: navigator.connection ? navigator.connection.effectiveType : "Unknown",
          platform: navigator.platform,
          language: navigator.language,
          memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown",
          browser: navigator.userAgent,
          gpu: gpuInfo,
          touchSupport: navigator.maxTouchPoints > 0 ? "Yes" : "No",
          webdriver: navigator.webdriver ? "Yes" : "No",
          battery: batteryLevel,
          hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
          timezoneMismatch: timezoneMismatch,

          canvasFingerprint: canvasHash, // Storing the compact SHA-256 hash
          fontsHash: fontsHash,
          webglVendor: webglVendor,
        });
      };

      navigator.getBattery?.()
        .then((battery) => setFullEnv(`${Math.round(battery.level * 100)}%`))
        .catch(() => setFullEnv("Unknown"));
    };

    initializeEnv(); // Call the async function

    // BEHAVIOR TRACKING (All synchronous code remains the same)
    let mouseMoveCount = 0;
    let scrollEventCount = 0;
    let keyboardEventCount = 0;
    let clickCount = 0;
    let focusChanges = 0;

    let lastMove = Date.now();
    let lastScroll = 0;

    let pathVariance = 0;
    let lastMouse = { x: null, y: null, time: null };
    let startMouse = { x: null, y: null };

    let directionChanges = 0;
    let lastDirection = null;

    let keyTimestamps = [];
    let startTime = Date.now();

    const mouseHandler = (e) => {
      lastMove = Date.now();
      if (!startPointRef.current) {
        startPointRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }

      mouseMoveCount++;
      setMetrics((prev) => ({ ...prev, mouseMoves: mouseMoveCount }));

      if (lastMouseRef.current.time !== null) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        const angle = Math.atan2(dy, dx);

        if (prevAngleRef.current !== null) {
          const angleDiff = Math.abs(angle - prevAngleRef.current);

          if (angleDiff > Math.PI / 4) {
            directionChangesRef.current += 1;
          }

        }

        prevAngleRef.current = angle;
        const dist = Math.sqrt(dx * dx + dy * dy);
        totalDistanceRef.current += dist;
        let straightnessValue = 0;

        if (startPointRef.current) {
          const displacement = Math.sqrt(
            Math.pow(e.clientX - startPointRef.current.x, 2) +
            Math.pow(e.clientY - startPointRef.current.y, 2)
          );

          if (totalDistanceRef.current > 0) {
            straightnessValue = displacement / totalDistanceRef.current;
          }
        }
        pathVariance += dist;
        const now = Date.now();
        const dtMs = now - lastMouseRef.current.time;

        let speed = 0;

        if (dtMs > 0) {
          speed = dist / dtMs;
        }

        if (!isFinite(speed) || speed < 0) speed = 0;

        mouseSpeedsRef.current.push(speed);

        // keep last 200 samples
        if (mouseSpeedsRef.current.length > 200) {
          mouseSpeedsRef.current.shift();
        }

        const speeds = mouseSpeedsRef.current;

        const avgSpeed =
          speeds.reduce((a, b) => a + b, 0) / speeds.length;

        const maxSpeed = Math.max(...speeds);

        const prevSpeed = speeds[speeds.length - 2] || 0;
        const jitter = Math.abs(speed - prevSpeed);
        setMetrics((prev) => ({
          ...prev,
          avgMouseSpeed: Number(avgSpeed.toFixed(4)),
          maxMouseSpeed: Number(maxSpeed.toFixed(4)),
          mouseJitter: Number((prev.mouseJitter * 0.7 + jitter * 0.3).toFixed(4)),
          pathVariance: Math.round(totalDistanceRef.current),
          directionChanges: directionChangesRef.current,
          straightness: Number(straightnessValue.toFixed(4)),
        }));
      }
      // Always update last mouse position
      lastMouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
      };

    };

    const scrollHandler = () => {
      scrollEventCount++;
      const now = Date.now();

      const currentScrollPosition =
        window.scrollY || window.pageYOffset || 0;

      const pixelsScrolled = Math.abs(
        currentScrollPosition - lastScrollPositionRef.current
      );

      let timeDelta = now - lastScroll;

      // 🛑 HARD PROTECTION
      if (!timeDelta || timeDelta <= 0) {
        timeDelta = 1;
      }

      let velocity = pixelsScrolled / timeDelta;

      if (!isFinite(velocity)) velocity = 0;

      let acceleration = (velocity - lastScrollVelocityRef.current) / timeDelta;

      if (!isFinite(acceleration)) acceleration = 0;

      let jitter = Math.abs(
        acceleration - lastScrollAccelerationRef.current
      );
      if (!isFinite(jitter)) jitter = 0;

      setMetrics((prev) => ({
        ...prev,
        scrollEvents: scrollEventCount,
        scrollVelocity: Number(velocity.toFixed(3)),
        scrollAcceleration: Number(acceleration.toFixed(3)),
        scrollJitter: Number(jitter.toFixed(3)),
      }));

      lastScrollPositionRef.current = currentScrollPosition;
      lastScrollVelocityRef.current = velocity;
      lastScrollAccelerationRef.current = acceleration;
      lastScroll = now;
    };

    const keyHandler = () => {
      keyboardEventCount++;
      const now = Date.now();
      keyTimestamps.push(now);

      // Keep only last 5 seconds
      keyTimestamps = keyTimestamps.filter((t) => now - t < 5000);

      if (keyTimestamps.length > 1) {
        const intervals = keyTimestamps
          .slice(1)
          .map((t, i) => t - keyTimestamps[i])
          .filter((i) => i > 0 && i < 2000); // safety filter

        if (intervals.length > 1) {
          const mean =
            intervals.reduce((a, b) => a + b, 0) / intervals.length;

          const variance =
            intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) /
            intervals.length;

          const burst =
            intervals.filter((i) => i < 120).length / intervals.length;

          setMetrics((prev) => ({
            ...prev,
            keyboardEvents: keyboardEventCount,
            avgKeyInterval: Math.round(mean),
            burstTypingRatio: Number(burst.toFixed(2)),
            pauseVariance: Math.round(Math.sqrt(variance)), // std dev
            typingSpeedVariance: Math.round(variance), // ✅ REAL variance
          }));
        }
      }
    };

    const clickHandler = () => {
      clickCount++;
      setMetrics((prev) => ({ ...prev, clicks: clickCount }));
    };

    const focusHandler = () => {
      focusChanges++;
      setMetrics((prev) => ({ ...prev, focusChanges }));
    };

    document.addEventListener("mousemove", mouseHandler);
    window.addEventListener("scroll", scrollHandler);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("click", clickHandler);
    window.addEventListener("focus", focusHandler);
    window.addEventListener("blur", focusHandler);

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const idle = Math.floor((Date.now() - lastMove) / 1000);

      setMetrics((prev) => ({
        ...prev,
        timeOnPage: elapsed,
        idleTime: idle,
      }));
    }, 1000);

    return () => {
      document.removeEventListener("mousemove", mouseHandler);
      window.removeEventListener("scroll", scrollHandler);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("click", clickHandler);
      window.removeEventListener("focus", focusHandler);
      window.removeEventListener("blur", focusHandler);
      clearInterval(timer);
    };
  }, []);

  const submitAadhaar = () => {
    if (/^\d{12}$/.test(aadhaar.trim())) {
      sendDataToBackend();
    } else {
      setNotification({
        text: "❌ Please enter a valid 12-digit Aadhaar number",
        type: "error",
      });
    }
  };

  // const sendDataToBackend = async () => {
  //   const payload = { aadhaar, env, metrics, timestamp: new Date().toISOString() };
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/collect", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await response.json();
  //     console.log("Server response:", data);
  //     setNotification({ text: "Data sent to backend successfully!", type: "success" });
  //   } catch (error) {
  //     console.error("Error sending data:", error);
  //     setNotification({ text: "Failed to send data to backend!", type: "error" });
  //   }

  //   setTimeout(() => setNotification({ text: "", type: "" }), 3000);
  // };
  //---------------------------
  //    const sendDataToBackend = async () => {
  //      const payload = { aadhaar, env, metrics, timestamp: new Date().toISOString() };

  //      try {
  //        const response = await fetch("https://unposed-unhobbling-seymour.ngrok-free.dev/collect", {
  //          method: "POST",
  //          headers: { "Content-Type": "application/json" },
  //          body: JSON.stringify(payload),
  //        });

  //        const data = await response.json();
  //        console.log("Server response:", data);

  //        setNotification({
  //          text: "Data sent to backend successfully!",
  //          type: "success",
  //        });
  //      } catch (error) {
  //        console.error("Error sending data:", error);
  //        setNotification({
  //          text: "Failed to send data to backend!",
  //          type: "error",
  //        });
  //      }
  //    setTimeout(() => setNotification({ text: "", type: "" }), 3000);
  //  };
  const sendDataToBackend = async () => {
    try {
      const payload = {
        aadhaar,
        env,
        metrics,
        timestamp: new Date().toISOString()
      };

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Prediction:", data);

      showPredictionNotification(data);

    } catch (error) {
      console.error("Prediction error:", error);
      setNotification({
        text: "❌ Unable to verify request",
        type: "error",
      });
    }
  };

  const showPredictionNotification = (data) => {
    let score = Number(data.confidence);

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    score = score.toFixed(2);

    if (data.verdict === "HUMAN") {
      setNotification({
        text: `✅ Genuine User Verified\nConfidence: ${score}%`,
        type: "human",
      });
    } else if (data.verdict === "BOT") {
      setNotification({
        text: `🚫 Automated Behavior Detected\nConfidence: ${score}%`,
        type: "bot",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="logo">
          {/* SVG Icon for the blue fingerprint look */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#3b82f6' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 15.5V17C11 17.55 11.45 18 12 18C12.55 18 13 17.55 13 17V15.5C13 14.95 12.55 14.5 12 14.5C11.45 14.5 11 14.95 11 15.5ZM12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13ZM18.5 13C19.33 13 20 12.33 20 11.5C20 10.67 19.33 10 18.5 10C17.67 10 17 10.67 17 11.5C17 12.33 17.67 13 18.5 13ZM5.5 13C6.33 13 7 12.33 7 11.5C7 10.67 6.33 10 5.5 10C4.67 10 4 10.67 4 11.5C4 12.33 4.67 13 5.5 13ZM12 4C8.69 4 6 6.69 6 10C6 11.88 6.94 13.59 8.35 14.57C7.63 15.17 7 15.96 7 17C7 18.66 8.34 20 10 20C11.13 20 12 18.88 12 17.5V16.5C12 16.22 12.22 16 12.5 16C12.78 16 13 16.22 13 16.5V17.5C13 18.88 13.87 20 15 20C16.66 20 18 18.66 18 17C18 15.96 17.37 15.17 16.65 14.57C18.06 13.59 19 11.88 19 10C19 6.69 16.31 4 13 4H12Z" fill="currentColor" />
          </svg>
          UIDAI Bot Detection System
        </div>
        <div className="doc-link">Documentation</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <a
          className={tab === "demo" ? "active" : ""}
          onClick={() => setTab("demo")}
        >
          Live Demo
        </a>

        <a
          className={tab === "params" ? "active" : ""}
          onClick={() => setTab("params")}
        >
          Parameters
        </a>

        <a
          className={tab === "arch" ? "active" : ""}
          onClick={() => setTab("arch")}
        >
          Architecture
        </a>
      </div>

      {/* Main Container */}
      {/* The .main container provides the overall grey background and stacks the content */}
      <div className="main stacked-layout">
        {tab === "demo" && (
          <>
            {/* 1. HERO CONTENT (On Grey Background) - SIZE & SPACING INCREASED */}
            <div className="grey-content-area hero-header">
              <div className="hero-icon">🔐</div>
              <h1>UIDAI Aadhaar Services</h1>
              <h3>Secure Resident Access</h3>
              <p>Seamless, CAPTCHA-Free, AI-Powered Protection</p>
            </div>

            {/* 2. WHITE BOX 1 (SS2 - Text Block) - HEIGHT/WIDTH/TEXT INCREASED */}
            <div className="stacked-box text-box">
              {/* First paragraph - Black color */}
              <p className="main-content-para">
                The Unique Identification Authority of India (UIDAI) provides secure and reliable Aadhaar services to residents across the country. To ensure uninterrupted access while protecting systems from automated abuse, UIDAI uses passive, AI-driven security mechanisms instead of traditional CAPTCHAs.
              </p>

              {/* Second paragraph - Grey color with small top margin */}
              <p className="secondary-content-para">
                This approach improves accessibility, reduces friction, and enhances the overall resident experience.
              </p>
            </div>

            {/* 3. WHITE BOX 2 (Features Block) */}
            <div className="stacked-box features-box">
              <h3 className="features-header">🛡️ How We Protect Aadhaar Services</h3>

              <p className="feature-intro-text">
                UIDAI employs an AI-powered passive bot detection system that continuously evaluates requests in real time.
              </p>

              <div className="feature-grid-v2">
                <div className="feature-item-v2">
                  <span>✓</span> No visual puzzles or CAPTCHAs
                </div>
                <div className="feature-item-v2">
                  <span>✓</span> No disruption to residents
                </div>
                <div className="feature-item-v2">
                  <span>✓</span> Protection against DoS/DDoS attacks
                </div>
                <div className="feature-item-v2">
                  <span>✓</span> Real-time request validation
                </div>
              </div>

              <p className="feature-footer-text">
                The system silently analyzes environmental signals and interaction patterns to differentiate between genuine users and automated scripts.
              </p>
            </div>

            {/* 4. SWAPPED POSITION: ANALYSIS BOX (Now 4th) */}
            <div className="stacked-box analysis-box">
              <h3 className="analysis-header">
                <span style={{ color: '#3b82f6' }}>🔍</span> What Information Is Analyzed?
              </h3>

              <p className="analysis-intro-text">
                To maintain security while respecting privacy, the system evaluates non-personal, session-level signals, such as:
              </p>

              <div className="analysis-grid">
                <div className="analysis-item">
                  <span>›</span> Browser and device environment
                </div>
                <div className="analysis-item">
                  <span>›</span> Timing and interaction patterns
                </div>
                <div className="analysis-item">
                  <span>›</span> Mouse movement and scrolling behavior
                </div>
                <div className="analysis-item">
                  <span>›</span> Focus and navigation consistency
                </div>
              </div>

              <div className="analysis-important-note">
                <strong>Important:</strong> No personal content, keystrokes, or Aadhaar data is stored or profiled.
              </div>
            </div>


            {/* 5. SWAPPED POSITION: PRIVACY BOX (Now 5th) */}
            <div className="stacked-box privacy-box">
              <h3 className="privacy-header">
                <span style={{ color: '#10b981' }}>🔒</span> Privacy & Data Protection
              </h3>

              <p className="privacy-intro-text">
                UIDAI is committed to protecting resident privacy.
              </p>

              <div className="privacy-list-grid">
                <div className="privacy-item">
                  <span>✓</span> No Aadhaar number is stored in plain text
                </div>
                <div className="privacy-item">
                  <span>✓</span> No personally identifiable information is logged
                </div>
                <div className="privacy-item">
                  <span>✓</span> No behavioral data is tracked across sessions
                </div>
                <div className="privacy-item">
                  <span>✓</span> All analysis is session-based and anonymized
                </div>
              </div>

              <p className="privacy-footer-text">
                This system fully adheres to UIDAI's core privacy and data-protection principles.
              </p>
            </div>

            {/* 6. NEW WHITE BOX: FAQ (Accordion) */}
            <div className="stacked-box faq-box">
              <h3 className="faq-header">
                <span style={{ color: '#3b82f6' }}>❓</span> Frequently Asked Questions
              </h3>

              <div className="accordion">
                {faqItems.map((item, index) => (
                  <div key={index} className="faq-item">
                    <div
                      className={`faq-question ${activeFAQ === item.question ? 'active' : ''}`}
                      onClick={() => handleFAQToggle(item.question)}
                    >
                      {item.question}
                      <span className="arrow">{activeFAQ === item.question ? '∧' : '∨'}</span>
                    </div>

                    {activeFAQ === item.question && (
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>


            {/* 7. FORM BOX (SS3 Form) - HEIGHT/WIDTH INCREASED (Now 7th) */}
            <div className="stacked-box form-box">
              {/* SS3 – FORM */}
              <h3 style={{ marginTop: "0px" }}>Quick Service Access</h3>

              <div className="form">
                <label htmlFor="aadhaar">Aadhaar Number</label>
                <input
                  type="text"
                  id="aadhaar"
                  value={aadhaar}
                  placeholder="Enter your 12-digit Aadhaar number"
                  maxLength="12"
                  inputMode="numeric"
                  onChange={(e) =>
                    setAadhaar(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />

                <div className="btn-box">
                  <button onClick={submitAadhaar}>Proceed Securely</button>
                </div>

                <small>Protected by AI-powered passive bot detection</small>
              </div>
            </div>
          </>
        )}

        {tab === "params" && (
          <div className="parameters">
            <div className="env-section">
              <h2>Environmental Parameters</h2>

              <div className="env-grid">
                {Object.entries(env).map(([key, value]) => (
                  <div className="env-card" key={key}>
                    <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</strong>

                    {/* FIX ADDED HERE → LONG STRINGS WRAP */}
                    <p style={{ wordBreak: "break-all" }}>{value}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ marginTop: "40px" }}>Behavioral Metrics</h2>
              <div className="param-grid">
                <div className="param-card blue"><strong>Mouse Movements</strong><p>{metrics.mouseMoves}</p></div>
                <div className="param-card green"><strong>Time on Page</strong><p>{metrics.timeOnPage}s</p></div>
                <div className="param-card purple"><strong>Scroll Events</strong><p>{metrics.scrollEvents}</p></div>
                <div className="param-card orange"><strong>Keyboard Events</strong><p>{metrics.keyboardEvents}</p></div>
                <div className="param-card pink"><strong>Path Variance</strong><p>{metrics.pathVariance}</p></div>
                <div className="param-card teal"><strong>Idle Time</strong><p>{metrics.idleTime}s</p></div>
                <div className="param-card yellow"><strong>Focus Changes</strong><p>{metrics.focusChanges}</p></div>
                <div className="param-card"><strong>Click Count</strong><p>{metrics.clicks}</p></div>
                <div className="param-card"><strong>Typing Speed Variance</strong><p>{metrics.typingSpeedVariance} ms</p></div>

                <div className="param-card"><strong>Avg Mouse Speed</strong><p>{metrics.avgMouseSpeed}</p></div>
                <div className="param-card"><strong>Max Mouse Speed</strong><p>{metrics.maxMouseSpeed}</p></div>
                <div className="param-card"><strong>Mouse Jitter</strong><p>{metrics.mouseJitter}</p></div>
                <div className="param-card"><strong>Direction Changes</strong><p>{metrics.directionChanges}</p></div>
                <div className="param-card"><strong>Straightness</strong><p>{metrics.straightness}</p></div>

                <div className="param-card"><strong>Avg Key Interval</strong><p>{metrics.avgKeyInterval} ms</p></div>
                <div className="param-card"><strong>Burst Typing Ratio</strong><p>{metrics.burstTypingRatio}</p></div>
                <div className="param-card"><strong>Pause Variance</strong><p>{metrics.pauseVariance}</p></div>

                <div className="param-card"><strong>Scroll Velocity</strong><p>{metrics.scrollVelocity}</p></div>
                <div className="param-card"><strong>Scroll Acceleration</strong><p>{metrics.scrollAcceleration}</p></div>
                <div className="param-card"><strong>Scroll Jitter</strong><p>{metrics.scrollJitter}</p></div>
              </div>

              <div style={{ marginTop: "40px", textAlign: "center" }}>
                <button onClick={sendDataToBackend}>Send Data to Backend</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {notification.text && (
        <div className={`notification ${notification.type}`}>
          {notification.text.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <style>{`
        html, body { height: 100%; margin: 0; font-family: "Inter", sans-serif; background: #f9fafb; color: #111827; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: #fff; border-bottom: 1px solid #e5e7eb; }
        .logo { font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
        .logo svg { width: 36px; height: 36px; } /* Use SVG for the updated logo */
        .doc-link { font-size: 16px; font-weight: 600; color: #1f2937; cursor: pointer; }
        .tabs { display: flex; gap: 40px; padding: 16px 40px; background: #fff; border-bottom: 1px solid #e5e7eb; font-size: 16px; font-weight: 500; }
        .tabs a { text-decoration: none; color: #6b7280; cursor: pointer; }
        .tabs a.active { color: #2563eb; border-bottom: 3px solid #06b6d4; padding-bottom: 6px; }

        /* Main layout adjustment for stacked boxes */
        .main.stacked-layout { 
          display: flex; 
          flex-direction: column; /* Stack boxes vertically */
          align-items: center; /* Center boxes horizontally */
          padding: 40px 60px; 
          gap: 20px; /* Gap between the stacked white boxes */
          width: 100%; /* Take full width to center content */
        }

        /* 🌟 HERO CONTENT (No Box) STYLES - AREA WIDTH & FONT SIZE INCREASED */
        .grey-content-area {
            max-width: 1100px; /* Increased width */
            width: 100%;
            padding: 0 32px; 
        }
        .hero-header {
            text-align: center;
            padding-bottom: 36px; 
        }
        .hero-header .hero-icon {
          font-size: 48px; 
          margin-bottom: 16px;
        }
        .hero-header h1 {
          font-size: 38px; 
          font-weight: 700;
          margin: 0;
        }
        .hero-header h3 {
          font-size: 22px; 
          font-weight: 500;
          color: #3b82f6;
          margin: 4px 0 8px 0;
        }
        .hero-header p {
          color: #6b7280;
          font-size: 19px; 
          margin: 0;
        }


        /* 🌟 STACKED WHITE BOX STYLES (Applies to all boxes: SS2 and SS3) - WIDTH & HEIGHT INCREASED */
        .stacked-box { 
            max-width: 1100px; /* Increased width */
            width: 100%;
            background: #fff; 
            border: 1px solid #e5e7eb; 
            border-radius: 12px; 
            padding: 50px 40px; /* Increased vertical and horizontal padding for bigger height/width */
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
        }
        
        /* 🌟 CUSTOM STYLES FOR THE TEXT BOX (SS1 content) - TEXT SIZE INCREASED */
        .text-box .main-content-para {
            font-size: 18px; 
            line-height: 1.6;
            color: #111827; 
            margin-bottom: 12px; 
        }

        .text-box .secondary-content-para {
            font-size: 18px; 
            line-height: 1.6;
            color: #6b7280; 
            margin-top: 12px; 
            margin-bottom: 0;
        }

        /* 🌟 FEATURES BOX Specific Styles */
        .features-box .features-header {
            font-weight: 600; 
            font-size: 20px; 
            margin-top: 0; 
            margin-bottom: 24px;
            display: flex; /* Added to align emoji */
            align-items: center;
            gap: 12px;
        }

        .features-box .feature-intro-text {
            font-size: 18px; 
            line-height: 1.6;
            color: #111827; /* Black text */
            margin-top: 0;
            margin-bottom: 24px;
        }

        .features-box .feature-grid-v2 {
          display: grid;
          grid-template-columns: repeat(1, 1fr); 
          gap: 16px; 
          margin-bottom: 24px;
        }

        .features-box .feature-item-v2 {
          background-color: #ecfdf5; /* Light green background */
          border: 1px solid #a7f3d0; /* Subtle green border */
          border-radius: 8px;
          padding: 16px 20px;
          font-size: 16px; 
          color: #111827; /* Black text */
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .features-box .feature-item-v2 span {
          color: #10b981; /* Green checkmark color */
          font-size: 20px;
          margin-right: 12px;
          font-weight: 700;
        }

        .features-box .feature-footer-text {
            font-size: 16px;
            line-height: 1.6;
            color: #6b7280; /* Grey text */
            margin-top: 0;
            margin-bottom: 0;
        }

        /* 🌟 ANALYSIS BOX Styles (Matching image_56585e.png) */
        .analysis-box .analysis-header {
            font-weight: 600; 
            font-size: 20px; 
            margin-top: 0; 
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .analysis-box .analysis-header span {
            font-size: 24px;
        }
        
        .analysis-box .analysis-intro-text {
            font-size: 18px; 
            line-height: 1.6;
            color: #111827; 
            margin-top: 0;
            margin-bottom: 24px;
        }
        
        .analysis-box .analysis-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* Back to 2 columns for this list */
          gap: 16px 30px; 
          margin-bottom: 30px;
        }

        .analysis-box .analysis-item {
          font-size: 16px; 
          color: #111827; 
          font-weight: 500;
          display: flex;
          align-items: center;
          padding: 5px 0;
        }

        .analysis-box .analysis-item span {
          color: #3b82f6; /* Blue pointer color */
          font-size: 20px;
          margin-right: 10px;
          font-weight: 900;
          line-height: 1; /* Aligns the > correctly */
        }
        
        .analysis-box .analysis-important-note {
          background-color: #ecfdf5; /* Same as feature box background */
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 20px 24px;
          font-size: 16px;
          line-height: 1.6;
          color: #111827;
        }
        .analysis-box .analysis-important-note strong {
            font-weight: 600;
        }

        /* 🌟 PRIVACY BOX Styles (Matching image_565839.png) */
        .privacy-box .privacy-header {
            font-weight: 600; 
            font-size: 20px; 
            margin-top: 0; 
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .privacy-box .privacy-header span {
            font-size: 24px;
        }
        
        .privacy-box .privacy-intro-text {
            font-size: 18px; 
            line-height: 1.6;
            color: #111827; 
            margin-top: 0;
            margin-bottom: 24px;
        }
        
        .privacy-box .privacy-list-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px; 
          margin-bottom: 24px;
        }

        .privacy-box .privacy-item {
          background-color: #f0fdf4; /* Very light green, lighter than feature box */
          border: 1px solid #d1fae5;
          border-radius: 8px;
          padding: 16px 20px;
          font-size: 16px; 
          color: #111827; 
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .privacy-box .privacy-item span {
          color: #34d399; /* Medium green checkmark color */
          font-size: 20px;
          margin-right: 12px;
          font-weight: 700;
        }
        
        .privacy-box .privacy-footer-text {
            font-size: 16px;
            line-height: 1.6;
            color: #6b7280; 
            margin-top: 0;
            margin-bottom: 0;
        }

        /* 🌟 FAQ Box Styles (New Section) */
        .faq-box .faq-header {
            font-weight: 600;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .faq-box .faq-header span {
            font-size: 24px;
        }
        .notification.human {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.notification.bot {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.notification.suspect {
  background: #fef9c3;
  color: #92400e;
  border: 1px solid #facc15;
}

        .accordion {
            border-top: 1px solid #e5e7eb; /* Top border for the whole section */
        }
        .faq-item {
            border-bottom: 1px solid #e5e7eb;
        }
        .faq-question {
            padding: 20px 0;
            font-size: 16px;
            font-weight: 500;
            color: #111827;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: color 0.2s;
        }
        /* Specific style for active question text color */
        .faq-question.active {
            color: #2563eb; 
        }
        .faq-question:hover {
            color: #3b82f6;
        }
        .faq-answer {
            padding-bottom: 20px;
            font-size: 16px;
            color: #4b5563; /* Gray text for the answer */
            line-height: 1.6;
            overflow: hidden;
        }
        .faq-answer p {
            margin: 0;
        }
        /* Specific style for arrow color and rotation */
        .faq-question .arrow {
            font-size: 18px;
            font-weight: 700;
            color: #9ca3af; /* Gray arrow color */
            transition: transform 0.2s;
        }
        /* The 'active' question's arrow is rotated */
        .faq-question.active .arrow {
            transform: rotate(180deg);
        }


        /* FORM BOX Specific Styles (SS3) */
        .form-box h3 {
            font-weight: 600; 
            font-size: 20px; 
            margin-bottom: 28px;
        }
        .form label { font-weight: 500; font-size: 16px; display: block; margin-bottom: 10px; }
        .form input { width: 100%; padding: 14px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 30px; font-size: 16px; }
        .form .btn-box { background: linear-gradient(90deg, #3b82f6, #06b6d4); padding: 4px; border-radius: 12px; }
        .form button { width: 100%; padding: 16px; font-size: 17px; font-weight: 600; color: #fff; border: none; border-radius: 8px; cursor: pointer; background: #3b82f6; }
        .form small { display: block; text-align: center; margin-top: 24px; color: #6b7280; font-size: 14px; }
        
        /* Notification styles (Unchanged) */
        .notification { position: fixed; bottom: 20px; right: 20px; padding: 14px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 1000; }
        .success { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
        .error { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
        
        /* Params Tab Styles (Internal padding increased for consistency) */
        .parameters { flex: 1; }
        .env-section { background: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; margin-bottom: 40px; }
        .env-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .env-card { background: #f3f4f6; padding: 20px 24px; border-radius: 10px; border: 1px solid #e5e7eb; }
        .param-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
        .param-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: left; }
        .param-card strong { display: block; font-size: 15px; color: #6b7280; margin-bottom: 8px; }
        .param-card p { font-size: 17px; font-weight: 600; color: #111827; margin: 0; }
        
        /* Ensure parameters page takes full width */
        .main > .parameters {
            max-width: 1350px; 

        /* 2. Set margin-left and margin-right to 'auto' to horizontally center the block. */
           margin-left: 30px;
           margin-right: auto;
           display: block;
        /* 3. Add a small amount of side padding (optional, but good practice) 
          to prevent the content from touching the screen edges on very small devices. */
           
        }
        
        
      `}</style>
    </div>
  );
}