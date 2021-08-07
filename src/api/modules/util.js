import GoogleLibPhone from "google-libphonenumber";
import type { HitResponse } from "./report-service";

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

export const handleListOfHits = (response) => {
  const hitResponse: HitResponse = response.hits;
  const docs = transformDoc(hitResponse.hits);
  return {
    list: docs,
    total: hitResponse.total.value,
  };
};

const transformDoc = (hits: any) => {
  if (Array.isArray(hits)) {
    return hits.map((docs) => {
      const { _source } = docs;
      return _source;
    });
  }
  return hits._source;
};
