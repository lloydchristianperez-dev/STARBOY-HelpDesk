const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'STARBOY HelpDesk API',
      version: '1.0.0',
      description: 'API documentation for STARBOY HelpDesk backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
      {
        url: 'https://starboy-helpdesk.onrender.com',
        description: 'Production server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
