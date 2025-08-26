import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:8000/graphql',
  documents: [
    'src/components/DataUploader.tsx', 
    'src/components/TaskStatusTracker.tsx',
    'src/queries/*.graphql',
    'src/pages/Dashboard.tsx'
  ],
  generates: {
    './src/queries/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '../types/graphql.ts',
      },
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query'
      ],
      config: {
        fetcher: 'graphql-request',
        exposeQueryKeys: true,
        exposeFetcher: true,
        addInfiniteQueryParam: false,
      }
    },
  },
  ignoreNoDocuments: true, // for better experience with the watcher
}

export default config
