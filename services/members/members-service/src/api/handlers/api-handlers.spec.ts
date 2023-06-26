import { handlers } from "./api-handlers";
import { CreateMemberSchema, Member } from "../schema";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
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
    get: ({ hk, sk }: { hk: string; sk: string }) =>
      // @ts-ignore
      Promise.resolve(db[hk + "-" + sk] as any),
  };

  beforeEach(() => {
    db = {};
  });
  it("should work", async () => {
    const sut = handlers(
      {
        topic: "membersTopic",
        keySchemaId: 1,
        valueSchemaId: 2,
      },
      mockSchemaRegistry,
      mockTable
    );
    const request = {
      safeBody: generateMock(CreateMemberSchema),
      jwt: { sub: "123", client_id: "123", isTestClient: true },
      userInfo: { email: "johnsmith@gmail.com" },
      jsonBody: {},
      pathParams: {},
      url: "/members" as const,
      method: "POST" as const,
      queryParams: {},
      headers: {},
    };
    const result = await sut.createMember(request as any);
    expect(result.statusCode).toEqual(201);
    const createdMember = result.body as Member;
    const ids = Object.keys(db);
    expect(ids.length).toEqual(2);
    const memberId = ids.find((id) => id.startsWith("MEMBER#"));
    expect(memberId).toBeDefined();
    // @ts-ignore
    const member = db[memberId!].data;
    expect(member).toMatchObject({ ...request.safeBody, isTestMember: true });
    const eventId = ids.find((id) => id.startsWith("MEMBER_CREATED_EVENT#"));
    expect(eventId).toBeDefined();
    // @ts-ignore
    expect(db[eventId!].topic).toEqual("membersTopic");
    const event = JSON.parse(
      // @ts-ignore
      Buffer.from(db[eventId!].value, "base64").toString("ascii")
    );
    expect(event).toMatchObject({
      eventId: expect.any(String),
      eventType: "MEMBER_CREATED",
    });
    const getRequest = {
      safeBody: generateMock(CreateMemberSchema),
      jwt: { sub: "123", client_id: "123", isTestClient: true },
      userInfo: { email: "johnsmith@gmail.com" },
      pathParams: { id: createdMember.id },
      url: `/members/{id}` as const,
      method: "GET" as const,
      queryParams: {},
      headers: {},
    };
    const fetchedMember = await sut.getMemberById(getRequest as any);
    expect(fetchedMember.statusCode).toEqual(200);
    expect(fetchedMember.body).toEqual(member);
  });
});
