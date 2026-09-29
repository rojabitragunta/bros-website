/** Sample size guide (body measurements in cm). Illustrative only. */
export const sizeGuide = {
  unit: "cm",
  columns: ["Size", "Chest", "Waist", "Hip", "Length"] as const,
  rows: [
    { size: "S", chest: "88–94", waist: "73–79", hip: "88–94", length: "69" },
    { size: "M", chest: "94–100", waist: "79–85", hip: "94–100", length: "71" },
    { size: "L", chest: "100–106", waist: "85–91", hip: "100–106", length: "73" },
    { size: "XL", chest: "106–112", waist: "91–97", hip: "106–112", length: "75" },
    { size: "XXL", chest: "112–118", waist: "97–103", hip: "112–118", length: "77" },
  ],
  howToMeasure: [
    { title: "Chest", body: "Measure around the fullest part of your chest, under the arms, keeping the tape level." },
    { title: "Waist", body: "Measure around your natural waistline, just above the belly button." },
    { title: "Hip", body: "Stand with feet together and measure around the fullest part of your hips." },
    { title: "Length", body: "Garment length from the highest point of the shoulder to the hem." },
  ],
  fitTips: [
    "Between sizes? Size up for a relaxed feel, down for a closer athletic fit.",
    "Oversized styles are cut roomy — take your usual size for the intended look.",
    "Leggings and sports bras are compressive; follow your hip and chest measurements closely.",
  ],
};
