export interface Environment {
  production: boolean;
  dotnetApiUrl: string;
  pythonApiUrl: string;
  encryptionKey: string;
}

export const environment: Environment = {
  production: true,
  dotnetApiUrl: 'https://localhost:7089',
  pythonApiUrl: 'http://localhost:8000',
  encryptionKey: 'MkRQW1WYVBQbdb36r5d8XErZjxWu7dEy',
};
