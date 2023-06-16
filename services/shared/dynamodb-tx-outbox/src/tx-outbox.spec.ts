import { TxOutboxMessage, _handler } from "./tx-outbox";

describe("tx-outbox", () => {
  it("should be defined", () => {
    expect(_handler).toBeDefined();
  });
  it("should forward message to kafka", async () => {
    const sendBatch = jest.fn();
    sendBatch.mockResolvedValueOnce({});
    const handler = _handler(
      Promise.resolve({
        sendBatch,
      })
    );
    const key = "key-1";
    const value = { id: 1, name: "Fred" };
    const key64 = Buffer.from(key).toString("base64");
    const value64 = Buffer.from(JSON.stringify(value)).toString("base64");
    const msg: TxOutboxMessage = {
      topic: "topic-1",
      key: key64,
      value: value64,
    };
    const dynamoSerializedTxMsg = {
      dynamodb: {
        NewImage: {
          data: {
            M: {
              topic: {
                S: msg.topic,
              },
              key: {
                S: msg.key,
              },
              value: {
                S: msg.value,
              },
            },
          },
        },
      },
    };
    const event = {
      Records: [dynamoSerializedTxMsg],
    };
    await handler(event, null as any, null as any);
    expect(sendBatch).toBeCalledWith({
      topicMessages: [
        {
          topic: msg.topic,
          messages: [
            {
              key: Buffer.from(msg.key!, "base64"),
              value: Buffer.from(msg.value, "base64"),
            },
          ],
        },
      ],
      acks: -1,
    });
  });
});