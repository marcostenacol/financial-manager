import { inject, injectable } from 'tsyringe';
import QRCode from 'qrcode';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';
import { assertOwnership } from '@/shared/authorization/ownership';
import { buildPixPayload } from '../utils/buildPixPayload';

export interface PersonPixQrCode {
  payload: string;
  qrCodeDataUrl: string;
}

@injectable()
export class GetPersonPixQrCodeService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
  ) {}

  async execute(id: string, userId: string, organizationIds: string[] = []): Promise<PersonPixQrCode> {
    const person = await this.personRepository.findById(id);
    assertOwnership(person, userId, organizationIds, 'Pessoa não encontrada');

    // O QR/copia-e-cola é sempre para PAGAR essa pessoa — por isso usa i_owe_them
    // (o que eu devo a ela), nunca they_owe_me (o que ela me deve).
    const payload = buildPixPayload({
      pixKey: person!.pixKey,
      merchantName: person!.name,
      merchantCity: person!.pixCity,
      amount: Number(person!.iOweThem),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(payload);

    return { payload, qrCodeDataUrl };
  }
}
