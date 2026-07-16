import Emergency from "../models/Emergency.js";
import asyncHandler from "../utils/asyncHandler.js";

const authorityRoles = [
  "responder",
  "hospital",
  "police",
  "shelter",
  "authority",
  "admin",
];

const ensureAuthorityAccess = (user) => {
  if (!authorityRoles.includes(user.role)) {
    const error = new Error(
      "Authority access is required for this action."
    );

    error.statusCode = 403;
    throw error;
  }
};

const getAllEmergencies = asyncHandler(
  async (request, response) => {
    ensureAuthorityAccess(request.user);

    const {
      status,
      severity,
      type,
      search,
    } = request.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (severity && severity !== "all") {
      query.severity = severity;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (search?.trim()) {
      const searchExpression = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        {
          emergencyId: searchExpression,
        },
        {
          naradaId: searchExpression,
        },
        {
          description: searchExpression,
        },
        {
          "location.zone": searchExpression,
        },
      ];
    }

    const emergencies = await Emergency.find(query)
      .sort({
        priorityScore: -1,
        createdAt: -1,
      })
      .populate(
        "user",
        "name naradaId role phone"
      )
      .populate(
        "assignedAuthority",
        "name naradaId role"
      );

    response.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies,
    });
  }
);

const getAuthoritySummary = asyncHandler(
  async (request, response) => {
    ensureAuthorityAccess(request.user);

    const [
      totalActive,
      critical,
      acknowledged,
      responding,
      resolved,
      cancelled,
    ] = await Promise.all([
      Emergency.countDocuments({
        status: {
          $in: [
            "active",
            "acknowledged",
            "responding",
          ],
        },
      }),

      Emergency.countDocuments({
        severity: "critical",
        status: {
          $in: [
            "active",
            "acknowledged",
            "responding",
          ],
        },
      }),

      Emergency.countDocuments({
        status: "acknowledged",
      }),

      Emergency.countDocuments({
        status: "responding",
      }),

      Emergency.countDocuments({
        status: "resolved",
      }),

      Emergency.countDocuments({
        status: "cancelled",
      }),
    ]);

    const byType = await Emergency.aggregate([
      {
        $match: {
          status: {
            $in: [
              "active",
              "acknowledged",
              "responding",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$type",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const averagePriorityResult =
      await Emergency.aggregate([
        {
          $match: {
            status: {
              $in: [
                "active",
                "acknowledged",
                "responding",
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averagePriority: {
              $avg: "$priorityScore",
            },
          },
        },
      ]);

    response.status(200).json({
      success: true,
      data: {
        totalActive,
        critical,
        acknowledged,
        responding,
        resolved,
        cancelled,

        averagePriority:
          averagePriorityResult[0]
            ?.averagePriority || 0,

        byType,
      },
    });
  }
);

const updateEmergencyStatus = asyncHandler(
  async (request, response) => {
    ensureAuthorityAccess(request.user);

    const {
      status,
      note = "",
      assignedTeam = "",
    } = request.body;

    const allowedStatuses = [
      "acknowledged",
      "responding",
      "resolved",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      response.status(400);

      throw new Error(
        "Invalid emergency status."
      );
    }

    const emergency =
      await Emergency.findById(
        request.params.id
      );

    if (!emergency) {
      response.status(404);

      throw new Error(
        "Emergency incident not found."
      );
    }

    if (
      ["resolved", "cancelled"].includes(
        emergency.status
      ) &&
      emergency.status !== status
    ) {
      response.status(400);

      throw new Error(
        "Closed incidents cannot be reopened."
      );
    }

    emergency.status = status;
    emergency.assignedAuthority =
      request.user._id;

    if (assignedTeam.trim()) {
      emergency.assignedTeam =
        assignedTeam.trim();
    }

    if (status === "acknowledged") {
      emergency.acknowledgedAt =
        emergency.acknowledgedAt ||
        new Date();
    }

    if (status === "resolved") {
      emergency.resolvedAt = new Date();
    }

    emergency.updates.push({
      status,
      note:
        note.trim() ||
        `Incident marked ${status}.`,

      updatedBy: request.user._id,
      timestamp: new Date(),
    });

    await emergency.save();

    const populatedEmergency =
      await Emergency.findById(
        emergency._id
      )
        .populate(
          "user",
          "name naradaId role phone"
        )
        .populate(
          "assignedAuthority",
          "name naradaId role"
        );

    request.app
      .get("io")
      ?.emit(
        "emergency:update",
        populatedEmergency
      );

    response.status(200).json({
      success: true,
      message:
        "Emergency incident updated successfully.",
      data: populatedEmergency,
    });
  }
);

const assignEmergencyTeam = asyncHandler(
  async (request, response) => {
    ensureAuthorityAccess(request.user);

    const {
      assignedTeam,
      note = "",
    } = request.body;

    if (!assignedTeam?.trim()) {
      response.status(400);

      throw new Error(
        "Assigned team is required."
      );
    }

    const emergency =
      await Emergency.findById(
        request.params.id
      );

    if (!emergency) {
      response.status(404);

      throw new Error(
        "Emergency incident not found."
      );
    }

    if (
      ["resolved", "cancelled"].includes(
        emergency.status
      )
    ) {
      response.status(400);

      throw new Error(
        "A team cannot be assigned to a closed incident."
      );
    }

    emergency.assignedAuthority =
      request.user._id;

    emergency.assignedTeam =
      assignedTeam.trim();

    if (emergency.status === "active") {
      emergency.status = "acknowledged";
      emergency.acknowledgedAt =
        new Date();
    }

    emergency.updates.push({
      status: emergency.status,

      note:
        note.trim() ||
        `${assignedTeam.trim()} assigned to this incident.`,

      updatedBy: request.user._id,
      timestamp: new Date(),
    });

    await emergency.save();

    const populatedEmergency =
      await Emergency.findById(
        emergency._id
      )
        .populate(
          "user",
          "name naradaId role phone"
        )
        .populate(
          "assignedAuthority",
          "name naradaId role"
        );

    request.app
      .get("io")
      ?.emit(
        "emergency:update",
        populatedEmergency
      );

    response.status(200).json({
      success: true,
      message:
        "Response team assigned successfully.",
      data: populatedEmergency,
    });
  }
);

export {
  getAllEmergencies,
  getAuthoritySummary,
  updateEmergencyStatus,
  assignEmergencyTeam,
};