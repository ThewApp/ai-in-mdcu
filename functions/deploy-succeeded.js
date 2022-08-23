import createVerify from "../src/hooks/createVerify";

export const handler = async (_event, _context) => {
  await createVerify();
};
