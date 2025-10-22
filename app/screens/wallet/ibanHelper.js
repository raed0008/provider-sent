//ibanHelper.js

export const detectCardType = (cardNumber = "") => {
  const clean = cardNumber.replace(/\s+/g, "");

  if (clean.startsWith("4")) return "visa";

  const firstTwo = clean.substring(0, 2);
  const firstFour = parseInt(clean.substring(0, 4));

  // MasterCard ranges
  if (
    (parseInt(firstTwo) >= 51 && parseInt(firstTwo) <= 55) ||
    (firstFour >= 2221 && firstFour <= 2720)
  )
    return "mastercard";

  // Mada ranges (Saudi)
  const madaPrefixes = [
    "50",
    "56",
    "57",
    "58",
    "59",
    "60",
    "62",
    "67",
    "68",
    "69",
  ];
  if (madaPrefixes.some((prefix) => clean.startsWith(prefix))) return "mada";

  return null;
};
