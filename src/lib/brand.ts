export const BRAND_LOGO = "/images/jon-logo.png";
export const BRAND_NAME = "Jön Coffee & Patisserie";
export const SELF_SERVICE_NOTE = "Siparişini kasada ver, hazır olduğunda tezgâhtan al.";

/** Replace the starter name while keeping owner-edited names editable. */
export function displayCafeName(name: string) {
  return name === "Kafe Adı" || !name.trim() ? BRAND_NAME : name;
}
