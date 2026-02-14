export default () => ({
  port: parseInt(String(process.env.PORT), 10) || 3000,
  environment: process.env.NODE_ENV || 'development',

  rabbitmq: {
    enabled: process.env.ENABLE_RMQ === 'true',
    url: process.env.RMQ_URL || 'amqp://guest:guest@localhost:5672',
    queueResults: process.env.RMQ_RESULTS_QUEUE || 'report_results',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  database: {
    url: process.env.DATABASE_URL,
  },
});
