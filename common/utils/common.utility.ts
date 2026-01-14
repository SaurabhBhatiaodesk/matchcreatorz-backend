import moment from 'moment-timezone';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

export const generateOtp = (length: number = 4): string => {
  let result = '';
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    result = '1234';
  } else {
    while (result.length < length) {
      result += crypto.randomInt(0, 9).toString();
    }
  }

  return result.padEnd(length, '0');
};

export const otpValidTill = () => {
  return utcDateTime(
    new Date(
      utcDateTime().valueOf() +
        (parseInt(process.env.OTP_VALID_MINUTES) || 5) * 60000,
    ),
  );
};

export const randomString = (length: number = 30): string => {
  let result: string = '';
  while (result.length < length) {
    result += crypto
      .randomBytes(length)
      .toString('hex')
      .substring(2, length + 2);
  }
  return result;
};

export const utcDateTime = (date: Date = new Date()): Date => {
  date = new Date(date);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
};

export const showDate = (
  date: Date,
  timeZone: string = '',
  format: string = 'MMM DD YYYY hh:mm A',
): string => {
  let formattedDate = 'N/A';
  // if this is invalid date
  if (utcDateTime(date).toString() !== 'Invalid Date') {
    formattedDate = timeZone
      ? moment(date).tz(timeZone).format(format)
      : moment.utc(date).format(format);
  }
  return formattedDate;
};

// Function to extract values from objects based on a key
export const arrayColumn = (arr: any[], key: string) =>
  arr.map((obj) => obj[key]);

// check arr1 all values exists in arr2
export const checkArrValuesExistInSecArr = (arr1: any[], arr2: any[]) => {
  return arr1.every((value) => arr2.includes(value));
};

export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

export const comparePassword = async (
  enteredPassword: string,
  dbPassword: string,
) => {
  const match = await bcrypt.compare(enteredPassword, dbPassword);
  return match;
};

export const callSocketApi = async (postData: any): Promise<boolean> => {
  try {
    const url = `${process.env.SOCKET_URL}/sendListener`;
    const headers = {
      'Content-Type': 'application/json',
      'accept-language': 'en',
      'x-market-place-platform': 'ios',
      'x-market-place-version': '1.0.0',
      'user-type': 'ADMIN'
    };

    const response = await axios.post(url, postData, { headers });
    // eslint-disable-next-line no-console
    console.log('socket response', response.data);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('socket error', error);
    return true; // Return true regardless of error
  }
};
