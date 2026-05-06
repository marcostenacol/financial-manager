import { container } from 'tsyringe';

import { CacheTrait } from '@/base/traits/CacheTrait';

// Traits & Base
container.registerSingleton<CacheTrait>('CacheTrait', CacheTrait);

// Repositories
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { AuthRepository } from '@/modules/auth/repositories/AuthRepository';
import { ProfileRepositoryInterface } from '@/modules/profile/repositories/contracts/ProfileRepositoryInterface';
import { ProfileRepository } from '@/modules/profile/repositories/ProfileRepository';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { WalletRepository } from '@/modules/wallets/repositories/WalletRepository';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { TransactionRepository } from '@/modules/transactions/repositories/TransactionRepository';

container.registerSingleton<AuthRepositoryInterface>('AuthRepository', AuthRepository);
container.registerSingleton<ProfileRepositoryInterface>('ProfileRepository', ProfileRepository);
container.registerSingleton<WalletRepositoryInterface>('WalletRepository', WalletRepository);
container.registerSingleton<TransactionRepositoryInterface>('TransactionRepository', TransactionRepository);

// Services
import { RegisterService } from '@/modules/auth/services/RegisterService';
import { LoginService } from '@/modules/auth/services/LoginService';
import { RefreshTokenService } from '@/modules/auth/services/RefreshTokenService';
import { LogoutService } from '@/modules/auth/services/LogoutService';
import { DetailProfileService } from '@/modules/profile/services/DetailProfileService';
import { UpdateProfileService } from '@/modules/profile/services/UpdateProfileService';
import { ChangeProfileTypeService } from '@/modules/profile/services/ChangeProfileTypeService';
import { UpdateAvatarService } from '@/modules/profile/services/UpdateAvatarService';
import { CreateWalletService } from '@/modules/wallets/services/CreateWalletService';
import { ListWalletsService } from '@/modules/wallets/services/ListWalletsService';
import { UpdateWalletService } from '@/modules/wallets/services/UpdateWalletService';
import { DeleteWalletService } from '@/modules/wallets/services/DeleteWalletService';
import { DetailWalletService } from '@/modules/wallets/services/DetailWalletService';
import { CreateTransactionService } from '@/modules/transactions/services/CreateTransactionService';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';
import { DetailTransactionService } from '@/modules/transactions/services/DetailTransactionService';
import { UpdateTransactionService } from '@/modules/transactions/services/UpdateTransactionService';
import { DeleteTransactionService } from '@/modules/transactions/services/DeleteTransactionService';

container.registerSingleton<RegisterService>('RegisterService', RegisterService);
container.registerSingleton<LoginService>('LoginService', LoginService);
container.registerSingleton<RefreshTokenService>('RefreshTokenService', RefreshTokenService);
container.registerSingleton<LogoutService>('LogoutService', LogoutService);
container.registerSingleton<DetailProfileService>('DetailProfileService', DetailProfileService);
container.registerSingleton<UpdateProfileService>('UpdateProfileService', UpdateProfileService);
container.registerSingleton<ChangeProfileTypeService>('ChangeProfileTypeService', ChangeProfileTypeService);
container.registerSingleton<UpdateAvatarService>('UpdateAvatarService', UpdateAvatarService);
container.registerSingleton<CreateWalletService>('CreateWalletService', CreateWalletService);
container.registerSingleton<ListWalletsService>('ListWalletsService', ListWalletsService);
container.registerSingleton<UpdateWalletService>('UpdateWalletService', UpdateWalletService);
container.registerSingleton<DeleteWalletService>('DeleteWalletService', DeleteWalletService);
container.registerSingleton<DetailWalletService>('DetailWalletService', DetailWalletService);
container.registerSingleton<CreateTransactionService>('CreateTransactionService', CreateTransactionService);
container.registerSingleton<ListTransactionsService>('ListTransactionsService', ListTransactionsService);
container.registerSingleton<DetailTransactionService>('DetailTransactionService', DetailTransactionService);
container.registerSingleton<UpdateTransactionService>('UpdateTransactionService', UpdateTransactionService);
container.registerSingleton<DeleteTransactionService>('DeleteTransactionService', DeleteTransactionService);
