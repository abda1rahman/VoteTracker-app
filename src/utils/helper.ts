export function generateRandomNumber(min= 1000000000, max= 9999999999): string{
return (Math.floor(Math.random() * (max - min + 1) + min)).toString();
}