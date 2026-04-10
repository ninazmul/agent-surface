import Counter from "./database/models/counter.model";

export const getNextleadSerial = async (): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { name: "lead" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

export const getNextQuotationSerial = async (): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { name: "quotation" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};
