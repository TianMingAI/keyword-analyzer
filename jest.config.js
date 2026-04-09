module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.vue$': '@vue/vue2-jest'
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: ['<rootDir>/tests/unit/**/*.spec.js']
}
