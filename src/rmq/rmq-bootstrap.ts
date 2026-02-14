import * as amqp from 'amqplib';

export async function createQueueBindings() {
  if (!process.env.RMQ_URL) return;

  const connection = await amqp.connect(process.env.RMQ_URL);
  const channel = await connection.createChannel();

  const queueName = 'report_results';
  const exchangeName = 'amq.topic';
  const routingKey = 'report.evaluation.completed';

  await channel.assertQueue(queueName, {
    durable: true,
  });

  await channel.assertExchange(exchangeName, 'topic', { durable: true });
  await channel.bindQueue(queueName, exchangeName, routingKey);

  console.log(
    `Fila "${queueName}" vinculada ao exchange "${exchangeName}" com routingKey "${routingKey}"`,
  );

  await channel.close();
  await connection.close();
}
