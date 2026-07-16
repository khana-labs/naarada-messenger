import crypto from "node:crypto";

import Emergency from "../models/Emergency.js";
import asyncHandler from "../utils/asyncHandler.js";

const createEmergencyId = () => {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `SOS-${randomPart}`;
};

const generateUniqueEmergencyId = async () => {
  let emergencyId;
  let exists = true;

  while (exists) {
    emergencyId = createEmergencyId();
    exists = await Emergency.exists({ emergencyId });
  }

  return emergencyId;
};

const calculatePriorityScore = ({
  severity,
  type,
  peopleAffected,
  batteryLevel,
}) => {
  const severityScore = {
    low: 30,
    medium: 50,
    high: 75,
    critical: 95,
  };

  const typeBonus = {
    medical: 10,
    fire: 10,
    trapped: 10,
    evacuation: 8,
    police: 6,
    missing_person: 6,
    shelter: 4,
    food_water: 3,
    other: 0,
  };

  let score =
    (severityScore[severity] || 75) +
    (typeBonus[type] || 0);

  if (Number(peopleAffected) >= 5) {
    score += 5;
  }

  if (
    batteryLevel !== null &&
    batteryLevel !== undefined &&
    Number(batteryLevel) <= 15
  ) {
    score += 5;
  }

  return Math.min(score, 100);
};

const simulateEmergencyRelay = async (request, emergencyId) => {
  const io = request.app.get("io");

  const firstHopTimer = setTimeout(async () => {
    try {
      const emergency = await Emergency.findById(emergencyId);

      if (!emergency || emergency.status !== "active") {
        return;
      }

      emergency.relayStatus = "relaying";
      emergency.currentHop = 1;

      emergency.updates.push({
        status: emergency.status,
        note: "SOS packet reached RELAY-01.",
        timestamp: new Date(),
      });

      await emergency.save();

      io?.emit("emergency:update", emergency);
    } catch (error) {
      console.error("Emergency relay first-hop error:", error.message);
    }
  }, 1500);

  const secondHopTimer = setTimeout(async () => {
    try {
      const emergency = await Emergency.findById(emergencyId);

      if (!emergency || emergency.status !== "active") {
        return;
      }

      emergency.relayStatus = "relaying";
      emergency.currentHop = 2;

      emergency.updates.push({
        status: emergency.status,
        note: "SOS packet reached RELAY-02.",
        timestamp: new Date(),
      });

      await emergency.save();

      io?.emit("emergency:update", emergency);
    } catch (error) {
      console.error("Emergency relay second-hop error:", error.message);
    }
  }, 3000);

  const authorityTimer = setTimeout(async () => {
    try {
      const emergency = await Emergency.findById(emergencyId)
        .populate("user", "name naradaId role")
        .populate("assignedAuthority", "name naradaId role");

      if (!emergency || emergency.status !== "active") {
        return;
      }

      emergency.relayStatus = "authority_reached";
      emergency.currentHop = emergency.route.length - 1;

      emergency.updates.push({
        status: emergency.status,
        note: "SOS packet reached the authority network.",
        timestamp: new Date(),
      });

      await emergency.save();

      io?.emit("emergency:new", emergency);
      io?.emit("emergency:update", emergency);
    } catch (error) {
      console.error("Emergency authority delivery error:", error.message);
    }
  }, 4500);

  firstHopTimer.unref?.();
  secondHopTimer.unref?.();
  authorityTimer.unref?.();
};

const createEmergency = asyncHandler(async (request, response) => {
  const {
    type,
    severity = "high",
    description,
    peopleAffected = 1,
    location = {},
    batteryLevel = null,
  } = request.body;

  if (!type) {
    response.status(400);
    throw new Error("Emergency type is required.");
  }

  if (!description?.trim()) {
    response.status(400);
    throw new Error("Emergency description is required.");
  }

  const emergencyId = await generateUniqueEmergencyId();

  const route = [
    request.user.naradaId,
    "RELAY-01",
    "RELAY-02",
    "AUTHORITY-NETWORK",
  ];

  const priorityScore = calculatePriorityScore({
    severity,
    type,
    peopleAffected,
    batteryLevel,
  });

  const emergency = await Emergency.create({
    emergencyId,
    user: request.user._id,
    naradaId: request.user.naradaId,
    type,
    severity,
    description: description.trim(),
    peopleAffected,
    location: {
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
      zone: location.zone?.trim() || "Unknown zone",
      accuracy: location.accuracy ?? null,
    },
    batteryLevel,
    priorityScore,
    route,
    currentHop: 0,
    relayStatus: "created",
    updates: [
      {
        status: "active",
        note: "SOS packet created.",
        updatedBy: request.user._id,
        timestamp: new Date(),
      },
    ],
  });

  const populatedEmergency = await Emergency.findById(emergency._id).populate(
    "user",
    "name naradaId role"
  );

  request.app.get("io")?.emit("emergency:update", populatedEmergency);

  simulateEmergencyRelay(request, emergency._id);

  response.status(201).json({
    success: true,
    message: "SOS packet created and priority routing started.",
    data: populatedEmergency,
  });
});

const getMyEmergencies = asyncHandler(async (request, response) => {
  const emergencies = await Emergency.find({
    user: request.user._id,
  })
    .sort({ createdAt: -1 })
    .populate("assignedAuthority", "name naradaId role");

  response.status(200).json({
    success: true,
    count: emergencies.length,
    data: emergencies,
  });
});

const getEmergencyById = asyncHandler(async (request, response) => {
  const emergency = await Emergency.findById(request.params.id)
    .populate("user", "name naradaId role phone")
    .populate("assignedAuthority", "name naradaId role");

  if (!emergency) {
    response.status(404);
    throw new Error("Emergency incident not found.");
  }

  const ownsIncident = emergency.user._id.equals(request.user._id);

  const authorityRoles = [
    "responder",
    "hospital",
    "police",
    "shelter",
    "authority",
    "admin",
  ];

  const canViewAsAuthority = authorityRoles.includes(request.user.role);

  if (!ownsIncident && !canViewAsAuthority) {
    response.status(403);
    throw new Error("You do not have permission to view this incident.");
  }

  response.status(200).json({
    success: true,
    data: emergency,
  });
});

const cancelEmergency = asyncHandler(async (request, response) => {
  const emergency = await Emergency.findById(request.params.id);

  if (!emergency) {
    response.status(404);
    throw new Error("Emergency incident not found.");
  }

  if (!emergency.user.equals(request.user._id)) {
    response.status(403);
    throw new Error("You can only cancel your own SOS.");
  }

  if (["resolved", "cancelled"].includes(emergency.status)) {
    response.status(400);
    throw new Error("This incident is already closed.");
  }

  emergency.status = "cancelled";

  emergency.updates.push({
    status: "cancelled",
    note: request.body.note?.trim() || "SOS cancelled by the user.",
    updatedBy: request.user._id,
    timestamp: new Date(),
  });

  await emergency.save();

  const populatedEmergency = await Emergency.findById(emergency._id).populate(
    "user",
    "name naradaId role"
  );

  request.app.get("io")?.emit("emergency:update", populatedEmergency);

  response.status(200).json({
    success: true,
    message: "SOS cancelled successfully.",
    data: populatedEmergency,
  });
});

export {
  createEmergency,
  getMyEmergencies,
  getEmergencyById,
  cancelEmergency,
};