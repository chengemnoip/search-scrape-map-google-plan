/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'], // 在 tests 目錄下尋找測試
  testMatch: [ // 測試檔案的模式
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      // ts-jest 配置選項
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageProvider: 'v8', // 使用 v8 收集覆蓋率
  collectCoverageFrom: [ // 包含在覆蓋率報告中的檔案
    'src/**/*.ts',
    '!src/index.ts', // 通常排除入口點
    '!src/types/**/*.ts', // 排除類型定義檔
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text', 'lcov', 'clover'], // 覆蓋率報告格式
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'] // 測試的設定檔
};