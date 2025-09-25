import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: 'development' | 'production';
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
};

export default config;