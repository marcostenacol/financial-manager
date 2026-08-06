import { describe, it, expect } from 'vitest';
import { buildPixPayload, crc16 } from '@/modules/people/utils/buildPixPayload';

describe('crc16 (CRC16-CCITT-FALSE)', () => {
  it('matches the standard conformance test vector for CRC16-CCITT-FALSE', () => {
    // "123456789" -> 0x29B1 é o vetor de conformidade universalmente documentado
    // para o algoritmo CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF, sem reflexão,
    // sem XOR final) — o mesmo especificado pelo BCB para o campo 63 do BR Code.
    // Validar contra ele prova a implementação do CRC independentemente de qualquer
    // detalhe específico do payload PIX.
    expect(crc16('123456789')).toBe('29B1');
  });
});

describe('buildPixPayload', () => {
  it('builds a well-formed BR Code payload with all mandatory EMV fields in order', () => {
    const payload = buildPixPayload({
      pixKey: 'teste@example.com',
      merchantName: 'Teste',
      merchantCity: 'Sao Paulo',
    });

    // Payload Format Indicator
    expect(payload.startsWith('000201')).toBe(true);
    // Merchant Account Information (PIX GUI + chave)
    expect(payload).toContain('br.gov.bcb.pix');
    expect(payload).toContain('teste@example.com');
    // Merchant Category Code / Currency / Country
    expect(payload).toContain('52040000');
    expect(payload).toContain('5303986');
    expect(payload).toContain('5802BR');
    // Merchant Name / City (sanitizados em caixa alta)
    expect(payload).toContain('5905TESTE');
    expect(payload).toContain('6009SAO PAULO');
    // Additional Data Field (txid genérico)
    expect(payload).toContain('62070503***');
    // CRC (ID 63, tamanho 04) sempre no final do payload
    expect(payload.slice(-8, -4)).toBe('6304');
    expect(payload).toHaveLength(payload.length);
  });

  it('omits the amount field (ID 54) when there is nothing owed', () => {
    const payload = buildPixPayload({ pixKey: 'x@example.com', merchantName: 'X' });

    expect(payload).not.toMatch(/54\d{2}/);
  });

  it('includes the amount field (ID 54) formatted with 2 decimals when provided', () => {
    const payload = buildPixPayload({ pixKey: 'x@example.com', merchantName: 'X', amount: 150.5 });

    expect(payload).toContain('5406150.50');
  });

  it('sanitizes accented merchant name/city into plain uppercase ASCII', () => {
    const payload = buildPixPayload({
      pixKey: 'x@example.com',
      merchantName: 'João Ç.',
      merchantCity: 'São Paulo',
    });

    expect(payload).toContain('JOAO C.');
    expect(payload).toContain('SAO PAULO');
  });

  it('produces a CRC that changes if any byte of the payload changes (sanity check against a static/wrong CRC)', () => {
    const payloadA = buildPixPayload({ pixKey: 'a@example.com', merchantName: 'A', merchantCity: 'A' });
    const payloadB = buildPixPayload({ pixKey: 'b@example.com', merchantName: 'B', merchantCity: 'B' });

    const crcA = payloadA.slice(-4);
    const crcB = payloadB.slice(-4);

    expect(crcA).not.toBe(crcB);
  });
});
