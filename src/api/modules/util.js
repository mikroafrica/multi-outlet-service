import GoogleLibPhone from "google-libphonenumber";

const phoneUtil = GoogleLibPhone.PhoneNumberUtil.getInstance();
const PNF = GoogleLibPhone.PhoneNumberFormat;

export const validatePhone = ({ phone, countryCode = "NG" }) => {
  const formatPhoneNumber = phoneUtil.parse(phone, countryCode);
  const isValid = phoneUtil.isValidNumber(formatPhoneNumber);
  if (!isValid) {
    throw new Error(`Phone number ${phone} is not valid`);
  }
  return phoneUtil.format(formatPhoneNumber, PNF.INTERNATIONAL);
};

export const convertToBase64 = (value: string) => {
  const buffer = Buffer.from(value);
  return buffer.toString("base64");
};
