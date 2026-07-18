import Trip from "../trip/trip.model.js";
import Memory from "../memory/memory.model.js";
import Expense from "../expense/expense.model.js";
import TimelineEvent from "./timelineEvent.model.js";
import genAI from "../../config/gemini.js";

// Call Gemini Helper with Retry
const callGeminiWithRetry = async (fn, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      console.log(`Gemini API Timeline call failed (attempt ${attempt}/${retries}). Retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// GET TIME OF DAY
const getTimeOfDay = (date) => {
  const hour = new Date(date).getHours();
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
};

// GET DAY NUMBER FOR EVENT
const getDayNumber = (eventDate, tripStartDate) => {
  const start = new Date(tripStartDate);
  const event = new Date(eventDate);
  const startClean = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const eventClean = new Date(event.getFullYear(), event.getMonth(), event.getDate());
  const diffTime = eventClean.getTime() - startClean.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays < 1 ? 1 : diffDays;
};

export const getTimelineService = async (tripId) => {
  const trip = await Trip.findById(tripId).populate("createdBy", "name").populate("members", "name");
  if (!trip) throw new Error("Trip not found");

  const memories = await Memory.find({ trip: tripId }).populate("user", "name profileImage");
  const expenses = await Expense.find({ trip: tripId }).populate("paidBy", "name");
  const customEvents = await TimelineEvent.find({ trip: tripId }).populate("createdBy", "name");

  // Merge all events
  const allEvents = [];

  // 1. Memories
  memories.forEach(mem => {
    allEvents.push({
      _id: mem._id,
      type: "Memory",
      icon: "📸",
      timestamp: mem.createdAt,
      timeOfDay: getTimeOfDay(mem.createdAt),
      title: "Memory Uploaded",
      description: mem.caption || "A new travel snapshot",
      details: {
        image: mem.image,
        caption: mem.caption,
        user: mem.user?.name,
        likesCount: mem.likesCount || 0,
        commentsCount: mem.commentsCount || 0
      }
    });
  });

  // 2. Expenses
  expenses.forEach(exp => {
    allEvents.push({
      _id: exp._id,
      type: "Expense",
      icon: "💸",
      timestamp: exp.createdAt,
      timeOfDay: getTimeOfDay(exp.createdAt),
      title: exp.title,
      description: `Spent ₹${exp.amount} on ${exp.category}`,
      details: {
        amount: exp.amount,
        category: exp.category,
        paidBy: exp.paidBy?.name,
        note: exp.note
      }
    });
  });

  // 3. Custom Events
  customEvents.forEach(evt => {
    let icon = "📍";
    let title = evt.title;
    let description = evt.description;

    if (evt.type === "Note") {
      icon = "📝";
      title = evt.title || "Custom Note";
      description = evt.noteText;
    } else if (evt.type === "AIStoryMarker") {
      icon = "🤖";
      title = evt.title || "AI Story Milestone";
    }

    allEvents.push({
      _id: evt._id,
      type: evt.type,
      icon,
      timestamp: evt.timestamp,
      timeOfDay: getTimeOfDay(evt.timestamp),
      title,
      description,
      details: {
        noteText: evt.noteText,
        locationData: evt.locationData,
        createdBy: evt.createdBy?.name,
        createdById: evt.createdBy?._id || evt.createdBy,
      }
    });
  });

  // Sort events chronologically
  allEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Determine trip start date
  const tripStartDate = trip.startDate || trip.date;

  // Group by day
  const daysMap = {};
  allEvents.forEach(event => {
    const dayNum = getDayNumber(event.timestamp, tripStartDate);
    if (!daysMap[dayNum]) {
      const dayDate = new Date(tripStartDate);
      dayDate.setDate(dayDate.getDate() + (dayNum - 1));
      daysMap[dayNum] = {
        dayNumber: dayNum,
        date: dayDate.toISOString().substring(0, 10),
        notes: "",
        events: []
      };
    }
    
    // If it's a Note event, aggregate its text into day notes field as well
    if (event.type === "Note") {
      if (daysMap[dayNum].notes) {
        daysMap[dayNum].notes += "\n" + event.description;
      } else {
        daysMap[dayNum].notes = event.description;
      }
    }

    daysMap[dayNum].events.push(event);
  });

  // Sort days
  const days = Object.values(daysMap).sort((a, b) => a.dayNumber - b.dayNumber);

  // Statistics calculation
  const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate total distance (simulated if locations logged)
  let totalDistance = 0;
  const locEvents = customEvents.filter(e => e.type === "Location" && e.locationData?.lat);
  if (locEvents.length > 1) {
    // Simple distance calculation between consecutive points (Haversine formula)
    const toRad = (x) => (x * Math.PI) / 180;
    for (let i = 0; i < locEvents.length - 1; i++) {
      const p1 = locEvents[i].locationData;
      const p2 = locEvents[i+1].locationData;
      const R = 6371; // km
      const dLat = toRad(p2.lat - p1.lat);
      const dLng = toRad(p2.lng - p1.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }
    totalDistance = Math.round(totalDistance * 10) / 10;
  }

  // Calculate total days duration
  let totalDays = 0;
  if (trip.startDate && trip.endDate) {
    const diff = new Date(trip.endDate) - new Date(trip.startDate);
    totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  } else {
    totalDays = days.length > 0 ? days[days.length - 1].dayNumber : 1;
  }

  const summaryStats = {
    totalDays,
    memoriesCount: memories.length,
    photosCount: memories.filter(m => m.image).length,
    expensesCount: expenses.length,
    totalDistance,
    totalCost
  };

  return {
    trip,
    summary: summaryStats,
    days,
    travelStory: trip.travelStory || "",
    tripSummary: trip.tripSummary || null
  };
};

export const createOrUpdateNoteService = async (tripId, userId, noteData) => {
  const { noteId, noteText, timestamp } = noteData;

  if (noteId) {
    const existing = await TimelineEvent.findById(noteId);
    if (!existing) throw new Error("Note event not found");
    if (existing.trip.toString() !== tripId) throw new Error("Unauthorized");
    existing.noteText = noteText;
    existing.description = noteText;
    await existing.save();
    return existing;
  }

  const newEvent = await TimelineEvent.create({
    trip: tripId,
    type: "Note",
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    title: "Trip Day Note",
    description: noteText,
    noteText,
    createdBy: userId
  });
  return newEvent;
};

export const addLocationCheckpointService = async (tripId, userId, locData) => {
  const { city, place, lat, lng, visitTime } = locData;
  const newEvent = await TimelineEvent.create({
    trip: tripId,
    type: "Location",
    timestamp: visitTime ? new Date(visitTime) : new Date(),
    title: place || "Location Checkpoint",
    description: `${city || "Unknown City"} (${lat || 0}, ${lng || 0})`,
    locationData: {
      city,
      place,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      visitTime: visitTime ? new Date(visitTime) : new Date()
    },
    createdBy: userId
  });
  return newEvent;
};

export const generateAITravelStoryService = async (tripId) => {
  const timelineData = await getTimelineService(tripId);
  const { trip, summary, days } = timelineData;

  // Format a timeline log for Gemini
  let timelineLog = `Trip Title: ${trip.title}\nDestination: ${trip.destination}\nTotal Budget: $${trip.budget}\nTotal Spent: ₹${summary.totalCost}\n`;
  days.forEach(day => {
    timelineLog += `\n--- Day ${day.dayNumber} (Date: ${day.date}) ---\n`;
    if (day.notes) timelineLog += `Day Notes: ${day.notes}\n`;
    day.events.forEach(evt => {
      const timeStr = new Date(evt.timestamp).toLocaleTimeString();
      timelineLog += `- [${evt.type}] [${evt.timeOfDay} at ${timeStr}] ${evt.title}: ${evt.description}\n`;
    });
  });

  const prompt = `
You are an expert travel writer and memories creator.
Based on the following detailed Trip log (containing memories, expenses, location points, and daily notes), write a beautiful, engaging travel story and provide summary metrics.

TRIP TIMELINE LOG:
${timelineLog}

You MUST return a JSON object with the exact format:
{
  "travelStory": "A beautiful travel story written in rich Markdown. Focus on highlights, best moments, funny moments, local food experiences, adventure feelings, and final emotional thoughts.",
  "tripSummary": {
    "totalMemories": ${summary.memoriesCount},
    "totalPhotos": ${summary.photosCount},
    "totalExpenses": ${summary.expensesCount},
    "citiesVisited": ["List of visited cities..."],
    "budgetSummary": "Comparison of spent ₹${summary.totalCost} against budget, and recommendations.",
    "favoriteDay": "Identify the best/favorite day based on notes and memories.",
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  }
}
Return only the raw JSON. Do not put markdown codes (like \`\`\`json) around it.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const aiOutput = await callGeminiWithRetry(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });

  // Clean JSON response (remove markdown wrappers if generated by AI)
  let cleanJson = aiOutput.trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.substring(7);
  }
  if (cleanJson.endsWith("```")) {
    cleanJson = cleanJson.substring(0, cleanJson.length - 3);
  }
  cleanJson = cleanJson.trim();

  let parsedOutput;
  try {
    parsedOutput = JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON. Output:", aiOutput);
    // Fallback if formatting failed
    parsedOutput = {
      travelStory: aiOutput,
      tripSummary: {
        totalMemories: summary.memoriesCount,
        totalPhotos: summary.photosCount,
        totalExpenses: summary.expensesCount,
        citiesVisited: [trip.destination],
        budgetSummary: `Total spent: ₹${summary.totalCost}.`,
        favoriteDay: "Day 1",
        recommendations: ["Review daily items to plan next time!"]
      }
    };
  }

  // Update Trip document
  trip.travelStory = parsedOutput.travelStory;
  trip.tripSummary = parsedOutput.tripSummary;
  await trip.save();

  // Create an AIStoryMarker timeline event to document this milestone
  await TimelineEvent.create({
    trip: tripId,
    type: "AIStoryMarker",
    title: "AI Travel Story Compiled",
    description: "Gemini analyzed trip expenses, notes, and photos to render a custom travel memoir.",
    createdBy: trip.createdBy
  });

  return parsedOutput;
};

// EDIT EVENT
export const editTimelineEventService = async (tripId, eventId, userId, updateData) => {
  const event = await TimelineEvent.findById(eventId);
  if (!event) {
    throw new Error("Timeline event not found");
  }
  if (event.trip.toString() !== tripId.toString()) {
    throw new Error("Unauthorized: Event does not belong to this trip");
  }
  if (event.createdBy.toString() !== userId.toString()) {
    throw new Error("Unauthorized: Only the creator of the event can edit it");
  }

  if (event.type === "Note") {
    if (updateData.noteText !== undefined) {
      event.noteText = updateData.noteText;
      event.description = updateData.noteText;
    }
  } else if (event.type === "Location") {
    if (updateData.city !== undefined || updateData.place !== undefined || updateData.lat !== undefined || updateData.lng !== undefined) {
      event.locationData = {
        ...event.locationData,
        city: updateData.city !== undefined ? updateData.city : event.locationData.city,
        place: updateData.place !== undefined ? updateData.place : event.locationData.place,
        lat: updateData.lat !== undefined ? Number(updateData.lat) : event.locationData.lat,
        lng: updateData.lng !== undefined ? Number(updateData.lng) : event.locationData.lng,
      };
      event.description = `${event.locationData.city || "Unknown City"} (${event.locationData.lat || 0}, ${event.locationData.lng || 0})`;
      if (event.locationData.place) {
        event.title = event.locationData.place;
      }
    }
  }

  if (updateData.timestamp) {
    event.timestamp = new Date(updateData.timestamp);
    if (event.type === "Location") {
      event.locationData.visitTime = event.timestamp;
    }
  }

  await event.save();
  return event;
};

// DELETE EVENT
export const deleteTimelineEventService = async (tripId, eventId, userId) => {
  const event = await TimelineEvent.findById(eventId);
  if (!event) {
    throw new Error("Timeline event not found");
  }
  if (event.trip.toString() !== tripId.toString()) {
    throw new Error("Unauthorized: Event does not belong to this trip");
  }
  if (event.createdBy.toString() !== userId.toString()) {
    throw new Error("Unauthorized: Only the creator of the event can delete it");
  }

  await TimelineEvent.deleteOne({ _id: eventId });
  return { success: true, message: "Timeline event deleted successfully", data: event };
};
