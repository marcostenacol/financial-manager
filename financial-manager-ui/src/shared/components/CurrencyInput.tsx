import { useEffect, useRef, useState } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  allowNegative?: boolean;
}

const formatCents = (digits: string): string => {
  const cents = Number(digits || '0');
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
};

export const CurrencyInput = ({
  value,
  onChange,
  placeholder = '0,00',
  className,
  id,
  required,
  allowNegative = false,
}: CurrencyInputProps) => {
  const [digits, setDigits] = useState(() => Math.round(Math.abs(value) * 100).toString());
  const [negative, setNegative] = useState(value < 0);
  const skipNextSync = useRef(false);

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    setDigits(Math.round(Math.abs(value) * 100).toString());
    setNegative(value < 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const isNegative = allowNegative && raw.trim().startsWith('-');
    const onlyDigits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

    setDigits(onlyDigits);
    setNegative(isNegative);

    const numeric = Number(onlyDigits || '0') / 100;
    skipNextSync.current = true;
    onChange(isNegative ? -numeric : numeric);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      required={required}
      value={`${negative ? '-' : ''}${formatCents(digits)}`}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};
