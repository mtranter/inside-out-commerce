export const mockSchemaRegistry = {
  encode: (registryId: number, payload: any): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const encodedData = Buffer.from(JSON.stringify(payload));
        resolve(encodedData);
      } catch (error) {
        reject(error);
      }
    });
  },
};
