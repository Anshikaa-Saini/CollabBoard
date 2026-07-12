const crypto = require("crypto");

// Excludes visually ambiguous characters (0/O, 1/I) for readability when sharing codes
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/**
 * Generates a random, human-friendly room code (e.g. "7XQK2P").
 * Uniqueness against existing rooms is enforced by the caller.
 */
const generateRoomCode = () => {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = crypto.randomInt(0, ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
};

module.exports = generateRoomCode;
