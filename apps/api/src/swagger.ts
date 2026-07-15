import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CloudPix API',
      version: '1.0.0',
      description: 'API Documentation for the CloudPix backend services.',
    },
    servers: [
      {
        url: 'http://localhost:3100',
        description: 'Local Development Server',
      },
    ],
    paths: {
      '/health/live': {
        get: {
          summary: 'Health Check',
          description: 'Check if the API is running.',
          responses: {
            '200': {
              description: 'API is alive.',
            },
          },
        },
      },
      '/api/upload/presigned-url': {
        post: {
          summary: 'Get Presigned Upload URL',
          description: 'Generates a presigned S3 URL to upload an asset.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fileName: {
                      type: 'string',
                      example: 'testbody.jpg',
                    },
                    fileType: {
                      type: 'string',
                      example: 'image/jpeg',
                    },
                  },
                  required: ['fileName', 'fileType'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successfully generated URL',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      uploadUrl: { type: 'string' },
                      assetId: { type: 'string' },
                      s3Key: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/upload/{uploadId}/status': {
        get: {
          summary: 'Get Upload Status',
          description: 'Check the processing status of an uploaded asset using its uploadId.',
          parameters: [
            {
              in: 'path',
              name: 'uploadId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'The Upload ID',
            },
          ],
          responses: {
            '200': {
              description: 'Successfully retrieved status',
            },
          },
        },
      },
      '/api/asset/{id}': {
        get: {
          summary: 'Get Asset Details',
          description: 'Retrieve the final asset details using its primary database ID.',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'The Asset Primary ID',
            },
          ],
          responses: {
            '200': {
              description: 'Successfully retrieved asset',
            },
          },
        },
      },
    },
  },
  apis: [], // No need to scan files since we defined the paths above
};

export const swaggerSpec = swaggerJsdoc(options);
