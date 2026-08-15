import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5 rounded-4 border border-secondary border-opacity-20" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>
          
          <h1 className="fw-bold text-warning mb-2">Privacy Policy</h1>
          <p className="text-secondary mb-4 small">Last Updated: August 15, 2026</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            
            <h4 className="text-warning mt-4 mb-3">1. Introduction</h4>
            <p>Your privacy is critically important to us. This Privacy Policy describes how TripShare collects, uses, shares, and handles your information when you use our platform.</p>

            <h4 className="text-warning mt-4 mb-3">2. Information We Collect</h4>
            <p>We collect information you provide directly to us, information collected automatically through your use of the Service, and information from third-party sources (e.g., Google OAuth).</p>

            <h4 className="text-warning mt-4 mb-3">3. Account Information</h4>
            <p>When you register, we collect your name, email address, and encrypted password. If you use Google OAuth, we receive your basic profile information as authorized by Google.</p>

            <h4 className="text-warning mt-4 mb-3">4. Profile and Social Information</h4>
            <p>You may optionally provide a bio, travel preferences, budget range, and social links. We also track your social interactions, including friends, followers, and users you have blocked.</p>

            <h4 className="text-warning mt-4 mb-3">5. Trip and Travel Information</h4>
            <p>We store the trips you create, join, or save. This includes itineraries, destinations, travel dates, and group members associated with those trips.</p>

            <h4 className="text-warning mt-4 mb-3">6. User-Generated Content</h4>
            <p>We collect the content you create, such as travel blogs, memories, photos (which are securely uploaded to Cloudinary), reviews, and comments.</p>

            <h4 className="text-warning mt-4 mb-3">7. Messages and Notifications</h4>
            <p>We store your in-app chat messages and group communications to provide historical context for your trips. We also track your notification preferences.</p>

            <h4 className="text-warning mt-4 mb-3">8. AI Features and AI Interactions</h4>
            <p>When you use the AI travel assistant, we collect your chat prompts and travel preferences to generate personalized packing lists, expense estimates, and recommendations. This data may be processed by third-party LLM providers (e.g., Google Gemini) to deliver the service.</p>

            <h4 className="text-warning mt-4 mb-3">9. Technical and Usage Information</h4>
            <p>We may collect technical data such as your IP address, device type, browser information, and usage patterns to maintain security and optimize the platform.</p>

            <h4 className="text-warning mt-4 mb-3">10. Cookies, Local Storage and Similar Technologies</h4>
            <p>TripShare uses local storage and cookies to maintain your active session (e.g., storing your JWT token) and remember your basic preferences. We do not currently use invasive third-party tracking cookies for targeted advertising.</p>

            <h4 className="text-warning mt-4 mb-3">11. How We Use Information</h4>
            <p>We use your information to provide, personalize, and improve the Service; to process your registration and authenticate you; to facilitate group travel planning; and to communicate important account alerts.</p>

            <h4 className="text-warning mt-4 mb-3">12. How Information Is Shared</h4>
            <p>We share your profile and travel information with other users according to your privacy settings and trip memberships. We do not sell your personal data to third parties.</p>

            <h4 className="text-warning mt-4 mb-3">13. Third-Party Services</h4>
            <p>We share necessary data with trusted third-party providers strictly to operate the Service (e.g., Cloudinary for image hosting, Google Gemini for AI features, and email delivery services). These providers are bound by confidentiality obligations.</p>

            <h4 className="text-warning mt-4 mb-3">14. Data Retention</h4>
            <p>We retain your personal data for as long as your account is active or as needed to provide you the Service. Some anonymized data or group chat history may be retained after account deletion to preserve trip integrity for other users.</p>

            <h4 className="text-warning mt-4 mb-3">15. Account Deactivation</h4>
            <p>If you choose to deactivate your account, your profile and content will be hidden from public view, but your data is retained securely in our database for future reactivation.</p>

            <h4 className="text-warning mt-4 mb-3">16. Account Deletion</h4>
            <p>If you request permanent account deletion, we destroy your personal profile, private blogs, and individual memories. To protect shared experiences, group trips and anonymized chat messages will remain accessible to the remaining group members.</p>

            <h4 className="text-warning mt-4 mb-3">17. Data Security</h4>
            <p>We implement industry-standard security measures, including password hashing (bcrypt) and secure tokenization (JWT). However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>

            <h4 className="text-warning mt-4 mb-3">18. User Privacy Rights</h4>
            <p>Depending on your location, you may have the right to access, correct, or delete your personal data. You can exercise these rights directly through your Account Settings or by contacting us.</p>

            <h4 className="text-warning mt-4 mb-3">19. Children's Privacy</h4>
            <p>TripShare is not intended for children under the legal age of consent. We do not knowingly collect personal information from children.</p>

            <h4 className="text-warning mt-4 mb-3">20. International Data Considerations</h4>
            <p>TripShare operates globally. Your data may be transferred to and processed in countries other than your own, which may have different data protection laws.</p>

            <h4 className="text-warning mt-4 mb-3">21. Changes to This Privacy Policy</h4>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes by updating the "Last Updated" date or providing an in-app alert.</p>

            <h4 className="text-warning mt-4 mb-3">22. Contact Information</h4>
            <p>For questions or concerns about this Privacy Policy or our data practices, please contact our support team through the application.</p>

          </div>

          <div className="mt-5 pt-4 border-top border-secondary border-opacity-20">
            <Link to="/" className="btn btn-outline-warning rounded-pill px-4">Return Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
