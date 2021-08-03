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

const stateToRegion = {
  lagos: {
    region: "south",
    zone: "south west",
  },
  ondo: {
    region: "south",
    zone: "south west",
  },
  ekiti: {
    region: "south",
    zone: "south west",
  },
  ogun: {
    region: "south",
    zone: "south west",
  },
  oyo: {
    region: "south",
    zone: "south west",
  },
  osun: {
    region: "south",
    zone: "south west",
  },
  edo: {
    region: "south",
    zone: "south south",
  },
  delta: {
    region: "south",
    zone: "south south",
  },
  bayelsa: {
    region: "south",
    zone: "south south",
  },
  rivers: {
    region: "south",
    zone: "south south",
  },
  akwaibom: {
    region: "south",
    zone: "south south",
  },
  crossriver: {
    region: "south",
    zone: "south south",
  },
  anambra: {
    region: "south",
    zone: "south east",
  },
  enugu: {
    region: "south",
    zone: "south east",
  },
  imo: {
    region: "south",
    zone: "south east",
  },
  abia: {
    region: "south",
    zone: "south east",
  },
  ebonyi: {
    region: "south",
    zone: "south east",
  },
  benue: {
    region: "north",
    zone: "north central",
  },
  kogi: {
    region: "north",
    zone: "north central",
  },
  kwara: {
    region: "north",
    zone: "north central",
  },
  nasarawa: {
    region: "north",
    zone: "north central",
  },
  niger: {
    region: "north",
    zone: "north central",
  },
  plateau: {
    region: "north",
    zone: "north central",
  },
  fct: {
    region: "north",
    zone: "north central",
  },
  adamawa: {
    region: "north",
    zone: "north east",
  },
  bauchi: {
    region: "north",
    zone: "north east",
  },
  borno: {
    region: "north",
    zone: "north east",
  },
  gombe: {
    region: "north",
    zone: "north east",
  },
  taraba: {
    region: "north",
    zone: "north east",
  },
  yobe: {
    region: "north",
    zone: "north east",
  },
  jigawa: {
    region: "north",
    zone: "north west",
  },
  kaduna: {
    region: "north",
    zone: "north west",
  },
  kano: {
    region: "north",
    zone: "north west",
  },
  katsina: {
    region: "north",
    zone: "north west",
  },
  kebbi: {
    region: "north",
    zone: "north west",
  },
  sokoto: {
    region: "north",
    zone: "north west",
  },
  zamfara: {
    region: "north",
    zone: "north west",
  },
};

export const getRegionAndZoneFromState = (state) => {
  if (!state) {
    return null;
  }
  const formattedState = state.replace(" ", "").trim().toLowerCase();

  return stateToRegion[formattedState];
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
