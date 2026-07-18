import genAI from "../../config/gemini.js";
import AIPackingList from "./aiPacking.model.js";
import Trip from "../trip/trip.model.js";

// EXPONENTIAL BACKOFF RETRY HELPER
const callGeminiWithRetry = async (fn, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      console.log(`Gemini API call failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms... Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

const packingModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are TripShare AI Packing Expert. You generate detailed, realistic, and highly contextual packing checklists based on destination weather, duration, activities, and budget limitations. Output must be a valid JSON object matching the requested schema. Do not output markdown code fences, standard text, or any surrounding wrappers. Output raw JSON only.",
  generationConfig: { responseMimeType: "application/json" }
});

export const generatePackingListService = async (tripId, userId, inputs) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error("Trip not found");
  }

  const destination = trip.destination;
  const weather = inputs.weather || "moderate";
  const duration = inputs.duration || 3;
  const budget = inputs.budget || "Budget";
  const tripType = trip.travelStyle || "Adventure";
  const activities = inputs.activities || trip.tags || [];

  const prompt = `
  Generate a packing list for a trip to: ${destination}.
  Weather context: ${weather}
  Duration: ${duration} days
  Trip Type: ${tripType}
  Budget tier: ${budget}
  Activities: ${activities.join(", ")}

  Generate items grouped by 4 categories: "Clothes", "Essentials", "Electronics", "Documents".
  Also recommend:
  1. Weather-specific alerts (up to 3 items)
  2. Safety suggestions (up to 3 items)
  3. Health recommendations (up to 3 items)
  4. List of things to avoid carrying (up to 4 items)

  Output format must exactly match this JSON schema structure:
  {
    "categories": [
      {
        "name": "Clothes",
        "items": ["Item name 1", "Item name 2"]
      },
      {
        "name": "Essentials",
        "items": ["Item name 1", "Item name 2"]
      },
      {
        "name": "Electronics",
        "items": ["Item name 1", "Item name 2"]
      },
      {
        "name": "Documents",
        "items": ["Item name 1", "Item name 2"]
      }
    ],
    "weatherAlerts": ["Alert 1"],
    "safetyTips": ["Tip 1"],
    "healthTips": ["Tip 1"],
    "thingsToAvoid": ["Avoid item 1"]
  }
  `;

  const textResponse = await callGeminiWithRetry(async () => {
    const result = await packingModel.generateContent(prompt);
    return result.response.text();
  });

  const parsedData = JSON.parse(textResponse);

  // Format array to include default 'checked: false' states
  const formattedCategories = parsedData.categories.map(cat => ({
    name: cat.name,
    items: cat.items.map(itemName => ({
      name: itemName,
      checked: false
    }))
  }));

  // Upsert database record: update if exists, insert if new
  let list = await AIPackingList.findOne({ trip: tripId, user: userId });
  if (list) {
    list.categories = formattedCategories;
    list.weatherAlerts = parsedData.weatherAlerts || [];
    list.safetyTips = parsedData.safetyTips || [];
    list.healthTips = parsedData.healthTips || [];
    list.thingsToAvoid = parsedData.thingsToAvoid || [];
    await list.save();
  } else {
    list = await AIPackingList.create({
      trip: tripId,
      user: userId,
      categories: formattedCategories,
      weatherAlerts: parsedData.weatherAlerts || [],
      safetyTips: parsedData.safetyTips || [],
      healthTips: parsedData.healthTips || [],
      thingsToAvoid: parsedData.thingsToAvoid || []
    });
  }

  return list;
};

export const getPackingListService = async (tripId, userId) => {
  return await AIPackingList.findOne({ trip: tripId, user: userId });
};

export const togglePackingItemService = async (tripId, userId, categoryName, itemId) => {
  const list = await AIPackingList.findOne({ trip: tripId, user: userId });
  if (!list) {
    throw new Error("Packing list not found");
  }

  const category = list.categories.find(c => c.name === categoryName);
  if (!category) {
    throw new Error("Category not found in packing list");
  }

  const item = category.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in category");
  }

  item.checked = !item.checked;
  await list.save();
  return list;
};
