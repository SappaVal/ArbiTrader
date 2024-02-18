import { DatabaseIntervalEnum } from '../enum/database-interval-enum';

export function convertToDatabaseInterval(
  interval: string,
): DatabaseIntervalEnum {
  const conversionMap = {
    '1': DatabaseIntervalEnum.ONE_MINUTE,
    '1m': DatabaseIntervalEnum.ONE_MINUTE,
    '3': DatabaseIntervalEnum.THREE_MINUTE,
    '3m': DatabaseIntervalEnum.THREE_MINUTE,
    '5': DatabaseIntervalEnum.FIVE_MINUTE,
    '5m': DatabaseIntervalEnum.FIVE_MINUTE,
    '15': DatabaseIntervalEnum.FIFTEEN_MINUTE,
    '15m': DatabaseIntervalEnum.FIFTEEN_MINUTE,
    '30': DatabaseIntervalEnum.THIRTY_MINUTE,
    '30m': DatabaseIntervalEnum.THIRTY_MINUTE,

    '60': DatabaseIntervalEnum.ONE_HOUR,
    '1h': DatabaseIntervalEnum.ONE_HOUR,
    '120': DatabaseIntervalEnum.TWO_HOUR,
    '2h': DatabaseIntervalEnum.TWO_HOUR,
    '240': DatabaseIntervalEnum.FOUR_HOUR,
    '4h': DatabaseIntervalEnum.FOUR_HOUR,
    '360': DatabaseIntervalEnum.SIX_HOUR,
    '6h': DatabaseIntervalEnum.SIX_HOUR,
    '720': DatabaseIntervalEnum.TWELVE_HOUR,
    '12h': DatabaseIntervalEnum.TWELVE_HOUR,

    D: DatabaseIntervalEnum.DAILY,
    '1d': DatabaseIntervalEnum.DAILY,
    W: DatabaseIntervalEnum.WEEKLY,
    '1w': DatabaseIntervalEnum.WEEKLY,
    M: DatabaseIntervalEnum.MONTHLY,
    '1M': DatabaseIntervalEnum.MONTHLY,
  };

  const dbInterval = conversionMap[interval];
  if (!dbInterval) {
    throw new Error(`Unsupported interval: ${interval}`);
  }
  return dbInterval;
}
