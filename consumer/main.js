import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test"
  }
});

async function processMessages() {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: "http://localhost:4566/000000000000/test-messages",
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20
    });

    const response = await sqs.send(command);

    if (response.Messages) {
      for (const message of response.Messages) {
        console.log("Mensaje recibido:", JSON.parse(JSON.parse(message.Body).Message));

        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: "http://localhost:4566/000000000000/test-messages",
          ReceiptHandle: message.ReceiptHandle
        });

        await sqs.send(deleteCommand);
        console.log("Mensaje procesado y eliminado");
      }
    }
  } catch (error) {
    console.error("Error al procesar mensajes:", error);
  }

  processMessages();
}

processMessages();
