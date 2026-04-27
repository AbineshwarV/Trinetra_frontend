import { parsePhoneNumberFromString } from "libphonenumber-js";

export function formatValidPhoneNumber(countryCode: string, mobile: string): string | null {
  const phoneNumber = parsePhoneNumberFromString(`${countryCode}${mobile}`);

  if (!phoneNumber?.isValid()) {
    return null;
  }

  return phoneNumber.number;
}
