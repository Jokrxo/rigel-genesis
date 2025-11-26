module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
