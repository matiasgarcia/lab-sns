import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test"
  }
});

async function publishMessage(message) {
  try {
    const command = new PublishCommand({
      TopicArn: "arn:aws:sns:us-east-1:000000000000:test",
      Message: JSON.stringify(message)
    });

    const response = await sns.send(command);
    console.log("Mensaje publicado:", response);
  } catch (error) {
    console.error("Error al publicar:", error);
  }
}

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time)
  })
}

async function run() {
  const dateString = new Date().toISOString();
  await publishMessage({
    title: "Test Message",
    content: `Hello! It's ${dateString}`,
    timestamp: dateString
  });

  await sleep(500);

  await run();
}

run();