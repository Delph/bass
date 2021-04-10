function number_format(x)
{
  return new Intl.NumberFormat().format(x);
}

function money_format(x)
{
  return `${new Intl.NumberFormat().format(x)}z`;
}

export { number_format, money_format };
