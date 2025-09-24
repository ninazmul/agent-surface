export const eventDefaultValues = {
  title: "",
  description: "",
  email: "",
  date: new Date(),
  createdAt: new Date(),
};

export const leadDefaultValues = {
  name: "",
  email: "",
  number: "",
  country: "",
  agency: "",
  course: {
    name: "",
    courseDuration: "",
    courseType: "",
    startDate: undefined,
    endDate: undefined,
    campus: {
      shift: "",
    },
  },
  dateOfBirth: new Date(),
  photo: "",
  passport: "",
  transcript: "",
  statementOfPurpose: "",
  author: "",
  status: "Submitted",
  amount: "",
  amountStatus: "Pending",
  commission: "",
  commissionStatus: "Pending",
  invoice: "",
  services: [],
  createdAt: new Date(),
};

export const profileDefaultValues = {
  name: "",
  logo: "",
  email: "",
  number: "",
  country: "",
  location: "",
  licenseDocument: "",
  agreementDocument: "",
  bankName: "",
  accountNumber: "",
  swiftCode: "",
  routingNumber: "",
  branchAddress: "",
  role: "Agent",
  countryAgent: "",
  status: "Pending",
  createdAt: new Date(),
};

export const downloadDefaultValues = {
  name: "",
  email: "",
  date: new Date(),
  country: "",
  documents: [],
  author: "",
  createdAt: new Date(),
};

export const promotionDefaultValues = {
  title: "",
  description: "",
  criteria: "",
  startDate: new Date(),
  endDate: new Date(),
  photo: "",
  country: "",
  createdAt: new Date(),
};

export const promotionQuotationDefaultValues = {
  title: "",
  agency: "",
  quotation: "",
  createdAt: new Date(),
};

export const resourceDefaultValues = {
  fileName: "",
  link: "",
  category: "",
  createdAt: new Date(),
};

export const invoiceDefaultValues = {
  name: "",
  email: "",
  services: [],
  status: "Pending",
  author: "",
  createdAt: new Date(),
};
