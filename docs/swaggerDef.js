module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'TechPath API Documentation',
    version: '1.0.0',
    description:
      'This will show all the available APIs for Techpath along with all required information',
    license: {
      name: 'Licensed Under ISC',
      url: 'https://spdx.org/licenses/ISC.html',
    },
    contact: {
      name: 'Newpath',
      url: 'http://newpath.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
};
