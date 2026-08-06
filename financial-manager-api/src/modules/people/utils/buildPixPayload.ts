/**
 * Construtor de payload PIX no padrão BR Code (EMV MPM — Manual de Padrões
 * para Iniciação do PIX, BCB). O payload gerado aqui é o mesmo texto usado
 * tanto no QR Code estático quanto no "PIX copia e cola".
 */

export interface BuildPixPayloadInput {
  pixKey: string;
  merchantName: string;
  merchantCity?: string | null;
  amount?: number | null;
}

const DEFAULT_MERCHANT_CITY = 'SAO PAULO';
const PIX_GUI = 'br.gov.bcb.pix';
const MERCHANT_NAME_MAX_LENGTH = 25;
const MERCHANT_CITY_MAX_LENGTH = 15;

/**
 * O campo de CRC (ID 63) tem tamanho fixo 04 e o checksum é calculado sobre o
 * payload inteiro já com "6304" no fim — daí este valor entrar antes do cálculo.
 */
const CRC_FIELD_PREFIX = '6304';

function sanitizeText(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, maxLength)
    .trim();
}

function emvField(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

/**
 * CRC16-CCITT-FALSE: polinômio 0x1021, valor inicial 0xFFFF, sem reflexão de
 * entrada/saída e sem XOR final — exatamente o especificado pelo BCB para o ID 63.
 */
export function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload({ pixKey, merchantName, merchantCity, amount }: BuildPixPayloadInput): string {
  const merchantAccountInformation = emvField('00', PIX_GUI) + emvField('01', pixKey);

  const fields = [
    emvField('00', '01'),
    emvField('26', merchantAccountInformation),
    emvField('52', '0000'),
    emvField('53', '986'),
    ...(amount && amount > 0 ? [emvField('54', amount.toFixed(2))] : []),
    emvField('58', 'BR'),
    emvField('59', sanitizeText(merchantName, MERCHANT_NAME_MAX_LENGTH)),
    emvField('60', sanitizeText(merchantCity || DEFAULT_MERCHANT_CITY, MERCHANT_CITY_MAX_LENGTH)),
    emvField('62', emvField('05', '***')),
  ];

  const payloadWithoutCrc = `${fields.join('')}${CRC_FIELD_PREFIX}`;

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}
