export const Constants = {
  e5cc: {
    variables: {
      setPoint: 0x2103,
      presentValue: 0x2000,
      status: 0x2406,
      p: 0x2A00,
      i: 0x2A01,
      d: 0x2A02,
    },
    commands: {
      run: 0x0000,
      stop: 0x0101,
      start: 0x0100,
      tune100: 0x0301,
      tune40: 0x0302,
      tuneCancel: 0X0300,
    },
    flags: {
      stopped: 256,
      tuning: 128,
      nocoil: 64,
    },
  },
};