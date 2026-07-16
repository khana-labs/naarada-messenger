import crypto from "node:crypto";

import User from "../server/models/User.js";

const createNaradaId = () => {
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `NRD-${randomPart}`;
};

const generateUniqueNaradaId = async () => {
  let naradaId;
  let alreadyExists = true;

  while (alreadyExists) {
    naradaId = createNaradaId();

    alreadyExists = await User.exists({ naradaId });
  }

  return naradaId;
};

export default generateUniqueNaradaId;