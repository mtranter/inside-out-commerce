import { handlers } from "./api-handlers";
import { CreateMemberSchema } from "./../schema";
import { TxOutboxMessageFactory } from "./../tx-outbox/tx-outbox";
import { generateMock } from "@anatine/zod-mock";

describe("handlers", () => {
  const encode = (registryId: number, payload: any): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const encodedData = Buffer.from(JSON.stringify(payload));
        resolve(encodedData);
      } catch (error) {
        reject(error);
      }
    });
  };
  const mockSchemaRegistry = {
    encode,
  };
  let db = {};
  const transactPut = async (items: ReadonlyArray<any>) => {
    items.map((i: any) => {
      // @ts-ignore
      db[i.item.hk + "-" + i.item.sk] = i.item;
    });
  };

  const mockTable = {
    transactPut,
  };

  const txOutboxMessageFactory = TxOutboxMessageFactory({
    registry: mockSchemaRegistry,
    topic: "membersTopic",
    keySchemaId: 1,
    valueSchemaId: 2,
  });
  beforeEach(() => {
    db = {};
  });
  it("should work", async () => {
    const sut = handlers(txOutboxMessageFactory, mockTable, "1");
    const request = {
      safeBody: generateMock(CreateMemberSchema),
      jwt: { sub: "123", client_id: "123" },
      userInfo: { email: "johnsmith@gmail.com" },
      pathParams: {},
      url: "/members" as const,
      method: "POST" as const,
      queryParams: {},
      headers: {},
    };
    const result = await sut.newMemberHandler(request);
    expect(result.statusCode).toEqual(200);
    const ids = Object.keys(db);
    expect(ids.length).toEqual(2);
    const memberId = ids.find((id) => id.startsWith("MEMBER#"));
    expect(memberId).toBeDefined();
    // @ts-ignore
    const member = db[memberId!].data;
    expect(member).toMatchObject({ ...request.safeBody, isTestMember: false });
    const eventId = ids.find((id) => id.startsWith("MEMBER_CREATED_EVENT#"));
    expect(eventId).toBeDefined();
    // @ts-ignore
    expect(db[eventId!].data.topic).toEqual("membersTopic");
    const event = JSON.parse(
      // @ts-ignore
      Buffer.from(db[eventId!].data.value, "base64").toString("ascii")
    );
    expect(event).toMatchObject({
      eventId: expect.any(String),
      eventType: "MEMBER_CREATED",
    });
  });
});
