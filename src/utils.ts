export const logDate = () => {
  const date = new Date();
  const padZero = (num, size) => {
    let s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  };

  const MM = padZero(date.getMonth() + 1, 2);
  const dd = padZero(date.getDate(), 2);
  const hh = padZero(date.getHours(), 2);
  const mm = padZero(date.getMinutes(), 2);
  const ss = padZero(date.getSeconds(), 2);
  const mmm = padZero(date.getMilliseconds(), 3);

  return `${MM}-${dd} ${hh}:${mm}:${ss}:${mmm}`;
};
export const getDateTime = (offset: number, range?: number) => {
  // create Date object for current location
  const d = new Date();

  // convert to msec
  // subtract local time zone offset
  // get UTC time in msec
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  const nd = new Date(utc + 3600000 * offset);

  const year = nd.getFullYear();
  const month = (nd.getMonth() + 1).toString().padStart(2, '0');
  const day = nd.getDate().toString().padStart(2, '0');
  const hour = nd.getHours().toString().padStart(2, '0');
  const minute = (Math.floor(nd.getMinutes() / (range || 1)) * (range || 1)).toString().padStart(2, '0');

  // return date, time
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    hour,
    minute,
  };
};
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
