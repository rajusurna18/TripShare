import { LifeBuoy, Handshake, Users, Newspaper, Zap, Heart, Compass, ShieldCheck, Globe2 } from "lucide-react";
import { FaInstagram, FaLinkedin, FaFacebook, FaTwitter, FaYoutube, FaWhatsapp } from "react-icons/fa";

export const PANELS = [
  {
    icon: LifeBuoy,
    title: "General Support",
    desc: "For account help, technical support, and general questions. We're here to help.",
    email: "support@tripshare.com",
    response: "Within 24 hours",
  },
  {
    icon: Handshake,
    title: "Business Partnerships",
    desc: "Interested in partnerships, collaborations, or sponsorship opportunities?",
    email: "partnerships@tripshare.com",
    response: "Within 24 hours",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Need help using TripShare or want to share ideas? Join our global community.",
    email: "community@tripshare.com",
    response: "Within 24 hours",
  },
  {
    icon: Newspaper,
    title: "Media & Press",
    desc: "Media inquiries and interviews with our founders and travel experts.",
    email: "press@tripshare.com",
    response: "Within 24 hours",
  }
];

export const CATEGORIES = [
  "Support",
  "Feedback",
  "Partnership",
  "Feature Request",
  "Bug Report",
  "General Inquiry",
];

export const MESSAGE_LIMIT = 800;

export const SOCIALS = [
  { name: "Instagram", icon: FaInstagram, handle: "@tripshare", link: "#" },
  { name: "LinkedIn", icon: FaLinkedin, handle: "TripShare Inc", link: "#" },
  { name: "Facebook", icon: FaFacebook, handle: "TripShareApp", link: "#" },
  { name: "X (Twitter)", icon: FaTwitter, handle: "@tripshare", link: "#" },
  { name: "YouTube", icon: FaYoutube, handle: "TripShare Official", link: "#" },
  { name: "WhatsApp", icon: FaWhatsapp, handle: "Coming Soon", link: "#" },
];

export const FAQS = [
  {
    question: "How do I create a trip?",
    answer: "Creating a trip is easy! Navigate to your Dashboard, click on 'Create Trip', and follow the intuitive wizard. You can set dates, destinations, and invite your friends all in one place.",
  },
  {
    question: "How can I invite friends?",
    answer: "Once your trip is created, you can invite friends via their email or TripShare username. You can also generate a secure shareable link to send via your preferred messaging app.",
  },
  {
    question: "How do shared expenses work?",
    answer: "TripShare includes an integrated expense tracker. Anyone in the trip can log an expense, choose who is involved, and our system automatically calculates who owes what. It even supports multiple currencies!",
  },
  {
    question: "How do I recover my account?",
    answer: "If you forgot your password, go to the Login page and click 'Forgot Password'. We will send an OTP (One-Time Password) to your registered email to help you securely reset your credentials.",
  },
  {
    question: "How do I report inappropriate content?",
    answer: "If you encounter any inappropriate content or behavior, click the three-dots menu next to the content and select 'Report'. Our moderation team reviews all reports within 24 hours.",
  },
  {
    question: "How do I contact TripShare support?",
    answer: "You can use the luxury support form above, or directly email us at support@tripshare.com. Our support agents operate globally and typically respond within 24 hours.",
  },
];

export const REASONS = [
  {
    icon: Zap,
    title: "Fast Support",
    desc: "Experience lightning-fast resolution times with our dedicated support staff across the globe.",
  },
  {
    icon: Heart,
    title: "Traveler First",
    desc: "Every feature and support protocol is designed with the traveler's experience at heart.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Your feedback shapes our roadmap. We build TripShare alongside our passionate community.",
  },
  {
    icon: Compass,
    title: "Continuous Innovation",
    desc: "We are constantly evolving, leveraging AI and modern tech to improve your journeys.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    desc: "Your data, payment info, and travel itineraries are protected with enterprise-grade security.",
  },
  {
    icon: Globe2,
    title: "Global Travel Community",
    desc: "Connect with travelers, explore public itineraries, and discover the world together.",
  },
];
