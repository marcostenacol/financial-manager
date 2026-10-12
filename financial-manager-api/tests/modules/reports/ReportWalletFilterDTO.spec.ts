import { describe, it, expect } from 'vitest';
import { ReportWalletFilterDTO } from '@/modules/reports/dtos/ReportWalletFilterDTO';

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

describe('ReportWalletFilterDTO', () => {
  it('should leave wallet_ids undefined when omitted or empty', () => {
    expect(ReportWalletFilterDTO.parse({}).wallet_ids).toBeUndefined();
    expect(ReportWalletFilterDTO.parse({ wallet_ids: '' }).wallet_ids).toBeUndefined();
  });

  it('should split a comma separated list of ids', () => {
    expect(ReportWalletFilterDTO.parse({ wallet_ids: `${ID_A}, ${ID_B}` }).wallet_ids).toEqual([ID_A, ID_B]);
  });

  it('should reject a value that is not a uuid', () => {
    expect(() => ReportWalletFilterDTO.parse({ wallet_ids: `${ID_A},nao-e-uuid` })).toThrow();
  });

  it('should reject more than 50 wallets', () => {
    const many = Array.from({ length: 51 }, () => ID_A).join(',');
    expect(() => ReportWalletFilterDTO.parse({ wallet_ids: many })).toThrow();
  });
});
