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
