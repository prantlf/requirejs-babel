async function delay (value) {
  console.log(`Waiting with "${value}" for 2 seconds...`);
  const result = await new Promise(resolve =>
    setTimeout(() => resolve(value), 2000));
  return result;
}

delay(1).then(value => {
  console.log('Delayed value:', value)
});
