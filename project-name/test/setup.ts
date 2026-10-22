jest.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn().mockResolvedValue(null),
    },
  },
}));
