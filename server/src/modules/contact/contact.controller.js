import Contact from "./contact.model.js";

// @desc    Submit a new contact form inquiry
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    // Basic Validation
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    // Save to Database
    const contact = await Contact.create({
      name,
      email,
      subject,
      category,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
