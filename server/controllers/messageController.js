import Message from "../models/Message.js";
import User from "../models/User.js";

import relayNodes from "../config/relayNodes.js";
import asyncHandler from "../utils/asyncHandler.js";

const populateMessage = async (messageId) => {
  return Message.findById(messageId)
    .populate("sender", "name naradaId")
    .populate("receiver", "name naradaId");
};

const emitMessageUpdate = async (request, messageId) => {
  const io = request.app.get("io");

  if (!io) {
    return;
  }

  const message = await populateMessage(messageId);

  if (!message) {
    return;
  }

  io.to(message.senderNaradaId).emit(
    "message-status-update",
    message
  );

  io.to(message.receiverNaradaId).emit(
    "message-status-update",
    message
  );
};

const simulateRelayRoute = async (request, messageId) => {
  const io = request.app.get("io");

  const advanceToFirstRelay = setTimeout(async () => {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return;
      }

      message.status = "relaying";
      message.currentHop = 1;

      message.hops.push({
        naradaId: message.route[1],
        timestamp: new Date(),
      });

      await message.save();
      await emitMessageUpdate(request, message._id);
    } catch (error) {
      console.error(
        "Relay simulation first-hop error:",
        error.message
      );
    }
  }, 2000);

  const advanceToSecondRelay = setTimeout(async () => {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return;
      }

      message.status = "relaying";
      message.currentHop = 2;

      message.hops.push({
        naradaId: message.route[2],
        timestamp: new Date(),
      });

      await message.save();
      await emitMessageUpdate(request, message._id);
    } catch (error) {
      console.error(
        "Relay simulation second-hop error:",
        error.message
      );
    }
  }, 4000);

  const deliverMessage = setTimeout(async () => {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return;
      }

      const receiverRouteIndex =
        message.route.length - 1;

      message.status = "delivered";
      message.currentHop = receiverRouteIndex;
      message.deliveredAt = new Date();

      message.hops.push({
        naradaId: message.receiverNaradaId,
        timestamp: new Date(),
      });

      await message.save();

      const populatedMessage = await populateMessage(
        message._id
      );

      if (!populatedMessage || !io) {
        return;
      }

      io.to(message.receiverNaradaId).emit(
        "receive-message",
        populatedMessage
      );

      io.to(message.senderNaradaId).emit(
        "message-status-update",
        populatedMessage
      );

      io.to(message.receiverNaradaId).emit(
        "message-status-update",
        populatedMessage
      );
    } catch (error) {
      console.error(
        "Relay simulation delivery error:",
        error.message
      );
    }
  }, 6000);

  advanceToFirstRelay.unref?.();
  advanceToSecondRelay.unref?.();
  deliverMessage.unref?.();
};

const sendMessage = asyncHandler(
  async (request, response) => {
    const {
      receiverNaradaId,
      content,
    } = request.body;

    if (!receiverNaradaId?.trim()) {
      response.status(400);
      throw new Error(
        "Receiver Narada ID is required."
      );
    }

    if (!content?.trim()) {
      response.status(400);
      throw new Error(
        "Message content is required."
      );
    }

    const normalizedReceiverId =
      receiverNaradaId
        .trim()
        .toUpperCase();

    const receiver = await User.findOne({
      naradaId: normalizedReceiverId,
    });

    if (!receiver) {
      response.status(404);
      throw new Error(
        "Receiver Narada ID not found."
      );
    }

    if (
      receiver._id.equals(request.user._id)
    ) {
      response.status(400);
      throw new Error(
        "You cannot send a message to yourself."
      );
    }

    const selectedRelays = relayNodes
      .filter(
        (relayNode) =>
          relayNode.status === "active"
      )
      .slice(0, 2);

    const route = [
      request.user.naradaId,
      ...selectedRelays.map(
        (relayNode) => relayNode.id
      ),
      normalizedReceiverId,
    ];

    const message = await Message.create({
      sender: request.user._id,
      receiver: receiver._id,

      senderNaradaId:
        request.user.naradaId,

      receiverNaradaId:
        normalizedReceiverId,

      content: content.trim(),

      encrypted: true,
      status: "pending",
      route,
      currentHop: 0,

      hops: [
        {
          naradaId:
            request.user.naradaId,

          timestamp: new Date(),
        },
      ],
    });

    const populatedMessage =
      await populateMessage(message._id);

    const io = request.app.get("io");

    if (io) {
      io.to(
        request.user.naradaId
      ).emit(
        "message-status-update",
        populatedMessage
      );
    }

    simulateRelayRoute(
      request,
      message._id
    );

    response.status(201).json({
      success: true,

      message:
        "Packet created and relay simulation started.",

      data: populatedMessage,
    });
  }
);

const getInbox = asyncHandler(
  async (request, response) => {
    const messages =
      await Message.find({
        receiver: request.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "sender",
          "name naradaId"
        )
        .populate(
          "receiver",
          "name naradaId"
        );

    response.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  }
);

const getSentMessages = asyncHandler(
  async (request, response) => {
    const messages =
      await Message.find({
        sender: request.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "sender",
          "name naradaId"
        )
        .populate(
          "receiver",
          "name naradaId"
        );

    response.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  }
);

export {
  sendMessage,
  getInbox,
  getSentMessages,
};