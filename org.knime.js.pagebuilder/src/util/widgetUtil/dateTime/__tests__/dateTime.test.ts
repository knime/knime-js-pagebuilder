import { describe, expect, it } from "vitest";

import { fromZonedTime, toZonedTime } from "..";

describe("fromZonedTime", () => {
  const createUTCDate = ({
    year = 2021,
    monthIndex = 0,
    day = 1,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  }: {
    year?: number;
    monthIndex?: number;
    day?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  } = {}) => {
    return new Date(
      Date.UTC(year, monthIndex, day, hours, minutes, seconds, milliseconds),
    );
  };

  it.each([fromZonedTime, toZonedTime])(
    "is idempotent for a UTC date to itself",
    (fromOrToZonedTime) => {
      const utcTime = createUTCDate();
      expect(fromOrToZonedTime(utcTime, "UTC")).toStrictEqual(utcTime);
    },
  );

  const cetUtcPairs = [
    [
      "winter",
      {
        cetTime: createUTCDate({ hours: 23 }),
        utcTime: createUTCDate({ hours: 22 }),
      },
    ] as const,
    [
      "summer",
      {
        cetTime: createUTCDate({ monthIndex: 6, day: 1, hours: 0 }),
        utcTime: createUTCDate({ monthIndex: 5, day: 30, hours: 22 }),
      },
    ] as const,
  ];

  it.each(cetUtcPairs)(
    "should convert CET to UTC in the %s",
    (_, { cetTime, utcTime }) => {
      expect(fromZonedTime(cetTime, "CET")).toStrictEqual(utcTime);
    },
  );

  it.each(cetUtcPairs)(
    "should convert UTC to CET in the %s",
    (_, { cetTime, utcTime }) => {
      expect(toZonedTime(utcTime, "CET")).toStrictEqual(cetTime);
    },
  );

  it("can convert a string to a zoned date", () => {
    const { utcTime, cetTime } = cetUtcPairs[0][1];
    const cetTimeString = cetTime.toISOString();
    expect(fromZonedTime(cetTimeString, "CET")).toStrictEqual(utcTime);
    expect(fromZonedTime(cetTimeString.replace("Z", ""), "CET")).toStrictEqual(
      utcTime,
    );
  });

  it("takes offsets in strings into account", () => {
    expect(fromZonedTime("2021-01-01T00:00:00+01:00", "UTC")).toStrictEqual(
      createUTCDate({ hours: -1 }),
    );
  });
});
