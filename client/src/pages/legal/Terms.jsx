import React from "react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div style={{ background: "#0c0c0e", minHeight: "100vh", color: "white", paddingTop: "80px", paddingBottom: "40px" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="glass-card p-5 rounded-4 border border-secondary border-opacity-20" style={{ background: "rgba(25, 25, 25, 0.45)", backdropFilter: "blur(12px)" }}>
          
          <h1 className="fw-bold text-warning mb-2">Terms & Conditions</h1>
          <p className="text-secondary mb-1 small">Last Updated: August 15, 2026</p>
          <p className="text-secondary mb-4 small">Version: 1.0</p>
          
          <div className="text-light" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
            
            <h4 className="text-warning mt-4 mb-3">1. Introduction</h4>
            <p>Welcome to TripShare! These Terms & Conditions govern your access to and use of the TripShare platform, including our website, mobile application, and related services (collectively, the "Service").</p>

            <h4 className="text-warning mt-4 mb-3">2. Acceptance of Terms</h4>
            <p>By creating an account, checking the "I agree to the TripShare Terms & Conditions" box, or otherwise accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not access or use the Service.</p>

            <h4 className="text-warning mt-4 mb-3">3. Eligibility</h4>
            <p>You must be of legal age in your jurisdiction to form a binding contract to use TripShare. By using the Service, you represent and warrant that you meet all eligibility requirements.</p>

            <h4 className="text-warning mt-4 mb-3">4. TripShare Account</h4>
            <p>To use most features, you must register for an account using a valid email address and password, or via a supported third-party identity provider (e.g., Google OAuth). You must provide accurate and complete information during registration.</p>

            <h4 className="text-warning mt-4 mb-3">5. Account Security</h4>
            <p>You are strictly responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. We are not liable for any loss or damage arising from your failure to protect your account.</p>

            <h4 className="text-warning mt-4 mb-3">6. Trips and Travel Participation</h4>
            <p>TripShare allows you to create, join, and manage collaborative travel itineraries ("Trips"). Trip administrators control group membership and can remove participants. Your participation in any real-world travel arranged via the Service is solely at your own risk.</p>

            <h4 className="text-warning mt-4 mb-3">7. User-Generated Content</h4>
            <p>You retain ownership of any text, photos, blogs, memories, or other material you post ("User-Generated Content"). By posting, you grant TripShare a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content to operate and provide the Service. You are solely responsible for ensuring your content does not violate any laws or third-party rights.</p>

            <h4 className="text-warning mt-4 mb-3">8. Profiles, Friends, Following and Blocking</h4>
            <p>Our platform includes social features allowing you to maintain a public or private profile, follow others, add friends, and block users. We reserve the right to limit, suspend, or terminate these interactions if they violate our policies.</p>

            <h4 className="text-warning mt-4 mb-3">9. Reviews, Memories, Blogs and Comments</h4>
            <p>You may submit reviews, publish travel blogs, log trip memories, and comment on other users' content. All submissions must be honest and free from defamatory, offensive, or illegally infringing material.</p>

            <h4 className="text-warning mt-4 mb-3">10. Messaging and Notifications</h4>
            <p>TripShare provides in-app messaging and notifications. You agree not to use these systems for spam, harassment, or transmitting malicious code.</p>

            <h4 className="text-warning mt-4 mb-3">11. AI Features and AI-Generated Information</h4>
            <p>TripShare utilizes generalized Large Language Models (LLMs) to provide automated travel assistance, packing lists, expense estimates, and recommendations. <strong>This AI-generated information is provided "as is" and is prone to errors, hallucinations, or outdated data. TripShare AI is NOT a substitute for professional legal, medical, or guaranteed travel advice.</strong> You must independently verify all AI outputs.</p>

            <h4 className="text-warning mt-4 mb-3">12. Expenses and Settlements</h4>
            <p>TripShare offers an expense tracking tool to help groups log shared costs. <strong>TripShare is strictly an informational tracker. We are NOT a bank, financial institution, or payment processor.</strong> We do not handle real money transfers, and we are not responsible for resolving financial disputes between users.</p>

            <h4 className="text-warning mt-4 mb-3">13. Prohibited Conduct</h4>
            <p>You agree not to use the Service to engage in illegal activities, upload malware, scrape data, impersonate others, or artificially manipulate reviews and ratings.</p>

            <h4 className="text-warning mt-4 mb-3">14. Intellectual Property</h4>
            <p>All TripShare branding, logos, software, and proprietary features are the exclusive property of TripShare and its licensors. You may not copy, modify, or distribute our intellectual property without express permission.</p>

            <h4 className="text-warning mt-4 mb-3">15. Third-Party Services</h4>
            <p>The Service integrates with third-party providers (e.g., Google, Google Gemini, Cloudinary). Your use of these integrations may be subject to the respective third parties' terms and policies. TripShare is not responsible for third-party service failures.</p>

            <h4 className="text-warning mt-4 mb-3">16. Travel and Safety Disclaimer</h4>
            <p>TripShare does not provide travel insurance, medical coverage, or safety guarantees. You are solely responsible for your own safety, visa processing, and adherence to local laws while traveling.</p>

            <h4 className="text-warning mt-4 mb-3">17. Platform Availability</h4>
            <p>We strive to maintain high uptime, but the Service may be interrupted for maintenance, updates, or unforeseen outages. We do not guarantee uninterrupted access.</p>

            <h4 className="text-warning mt-4 mb-3">18. Account Deactivation</h4>
            <p>You may temporarily deactivate your account in your Settings. Deactivation hides your profile but preserves your data for future reactivation.</p>

            <h4 className="text-warning mt-4 mb-3">19. Account Deletion</h4>
            <p>You may permanently delete your account. <strong>This action is irreversible.</strong> To protect shared group data, you must leave or delete all active Trips before you can delete your account. Upon deletion, your personal content is destroyed, but your contributions to group messaging may be preserved anonymously to maintain chat integrity.</p>

            <h4 className="text-warning mt-4 mb-3">20. Termination and Suspension</h4>
            <p>We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if you violate these Terms or pose a risk to the platform.</p>

            <h4 className="text-warning mt-4 mb-3">21. Limitation of Liability</h4>
            <p>To the maximum extent permitted by law, TripShare and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.</p>

            <h4 className="text-warning mt-4 mb-3">22. Indemnification</h4>
            <p>You agree to indemnify and hold harmless TripShare, its employees, and affiliates from any claims, damages, or legal expenses arising from your violation of these Terms or your User-Generated Content.</p>

            <h4 className="text-warning mt-4 mb-3">23. Changes to These Terms</h4>
            <p>We may update these Terms from time to time. We will indicate the "Last Updated" date at the top of this page. Continued use of the Service after changes are published constitutes your acceptance of the revised Terms.</p>

            <h4 className="text-warning mt-4 mb-3">24. Governing Law and Dispute Resolution</h4>
            <p>These Terms shall be governed by the laws of the jurisdiction in which TripShare operates, without regard to conflict of law principles. Any disputes shall be resolved in the competent courts of that jurisdiction.</p>

            <h4 className="text-warning mt-4 mb-3">25. Contact Information</h4>
            <p>If you have any questions regarding these Terms, please contact us via the support channels provided within the application.</p>

          </div>

          <div className="mt-5 pt-4 border-top border-secondary border-opacity-20">
            <Link to="/" className="btn btn-outline-warning rounded-pill px-4">Return Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
