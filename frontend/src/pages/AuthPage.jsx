import { SignInButton } from "@clerk/clerk-react";
import "../styles/auth.css";

const AuthPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="brand-container">
            <img
              src="/logo-icon.png"
              alt="convohub-logo"
              className="brand-logo"
            />
            <span className="brand-name">ConvoHub 💬</span>
          </div>

          <h1 className="hero-title">Where Conversations Connect 🌍</h1>

          <p className="hero-subtitle">
            Seamlessly bring your team together with real-time chats, effortless
            collaboration, and a workspace designed for productivity and fun.
            🚀✨
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>Real-time Messaging</span>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🎥</span>
              <span>Video Calls and Meetings</span>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔓</span>
              <span>Secure and Private</span>
            </div>
          </div>

          <SignInButton mode="modal">
            <button className="cta-button">Get Started</button>
          </SignInButton>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-image-container">
          <img
            src="/auth-i.png"
            alt="Team collaboration"
            className="auth-image"
          />
          <div className="image-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
