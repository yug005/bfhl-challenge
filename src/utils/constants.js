const EDGE_REGEX = /^[A-Z]->[A-Z]$/;

const USER_ID = process.env.USER_ID || '';
const EMAIL_ID = process.env.EMAIL_ID || '';
const COLLEGE_ROLL_NUMBER = process.env.COLLEGE_ROLL_NUMBER || '';
const OPERATION_CODE = 1;

module.exports = {
  EDGE_REGEX,
  USER_ID,
  EMAIL_ID,
  COLLEGE_ROLL_NUMBER,
  OPERATION_CODE,
};
