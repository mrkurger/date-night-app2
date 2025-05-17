/**
 * Mock implementation of bcrypt for testing
 */
export default {
  hash: jest.fn().mockImplementation((data, salt) => Promise.resolve(`hashed_${data}`)),
  compare: jest.fn().mockImplementation((data, hash) => Promise.resolve(hash === `hashed_${data}`)),
  genSalt: jest.fn().mockImplementation(rounds => Promise.resolve(`salt_${rounds}`)),
};
