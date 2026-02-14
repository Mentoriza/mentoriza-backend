import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { createQueueBindings } from './rmq/rmq-bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: false,
  });

  const config = new DocumentBuilder()
    .setTitle('API - Gerenciamento de Grupos e Relatórios')
    .setDescription(
      'API para coordenadores gerenciarem estudantes, grupos, submissões e indicadores ABNT/IA',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      content: document,
      pageTitle: 'Mentoriza - Scalar Docs',
      theme: 'purple',
      hideDownloadButton: false,
    }),
  );

  SwaggerModule.setup('api', app, document);

  if (process.env.ENABLE_RMQ === 'true') {
    await createQueueBindings();
    const rmqUrl = process.env.RMQ_URL;
    if (!rmqUrl) {
      console.error(
        'RMQ_URL não definido no ambiente. Microservice não será iniciado.',
      );
    } else {
      console.log(
        `Conectando ao RabbitMQ: ${rmqUrl.replace(/:\/\/.*@/, '://***@')}`,
      );
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: 'report_results',
          queueOptions: { durable: true },
          noAck: false,
          prefetchCount: 10,
          exchange: 'amq.topic',
          routingKey: 'report.evaluation.completed',
          exchangeType: 'topic',
        },
      });

      await app.startAllMicroservices();
    }
  } else {
    console.log('Microservice RMQ desabilitado (ENABLE_RMQ !== true)');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(
    `Aplicação rodando na porta ${port} | Swagger: http://localhost:${port}/api`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro fatal no bootstrap:', err);
  process.exit(1);
});
