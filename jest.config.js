module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    coverageDirectory: '../coverage',
    collectCoverageFrom: ['**/*.ts'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '.interface.ts',
      '.dto.ts',
      '.entity.ts',
      '.module.ts',
      'main.ts'
    ]
};