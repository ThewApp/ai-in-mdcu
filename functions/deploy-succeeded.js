import createVerify from "../src/createVerify";

export const handler = async (_event, _context) => {
  await createVerify();
};
