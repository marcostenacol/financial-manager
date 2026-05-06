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
import { CategoryRepositoryInterface } from '@/modules/categories/repositories/contracts/CategoryRepositoryInterface';
import { CategoryRepository } from '@/modules/categories/repositories/CategoryRepository';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { RecurrenceRepository } from '@/modules/recurrences/repositories/RecurrenceRepository';
import { ReportRepositoryInterface } from '@/modules/reports/repositories/contracts/ReportRepositoryInterface';
import { ReportRepository } from '@/modules/reports/repositories/ReportRepository';

container.registerSingleton<AuthRepositoryInterface>('AuthRepository', AuthRepository);
container.registerSingleton<ProfileRepositoryInterface>('ProfileRepository', ProfileRepository);
container.registerSingleton<WalletRepositoryInterface>('WalletRepository', WalletRepository);
container.registerSingleton<TransactionRepositoryInterface>('TransactionRepository', TransactionRepository);
container.registerSingleton<CategoryRepositoryInterface>('CategoryRepository', CategoryRepository);
container.registerSingleton<RecurrenceRepositoryInterface>('RecurrenceRepository', RecurrenceRepository);
container.registerSingleton<ReportRepositoryInterface>('ReportRepository', ReportRepository);

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
import { TransferService } from '@/modules/transactions/services/TransferService';
import { CreateCategoryService } from '@/modules/categories/services/CreateCategoryService';
import { ListCategoriesService } from '@/modules/categories/services/ListCategoriesService';
import { UpdateCategoryService } from '@/modules/categories/services/UpdateCategoryService';
import { DeleteCategoryService } from '@/modules/categories/services/DeleteCategoryService';
import { CreateRecurrenceService } from '@/modules/recurrences/services/CreateRecurrenceService';
import { ListRecurrencesService } from '@/modules/recurrences/services/ListRecurrencesService';
import { ProcessRecurrenceService } from '@/modules/recurrences/services/ProcessRecurrenceService';
import { GetDashboardOverviewService } from '@/modules/reports/services/GetDashboardOverviewService';
import { GetExpensesByCategoryService } from '@/modules/reports/services/GetExpensesByCategoryService';
import { GetMonthlyEvolutionService } from '@/modules/reports/services/GetMonthlyEvolutionService';

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
container.registerSingleton<TransferService>('TransferService', TransferService);
container.registerSingleton<CreateCategoryService>('CreateCategoryService', CreateCategoryService);
container.registerSingleton<ListCategoriesService>('ListCategoriesService', ListCategoriesService);
container.registerSingleton<UpdateCategoryService>('UpdateCategoryService', UpdateCategoryService);
container.registerSingleton<DeleteCategoryService>('DeleteCategoryService', DeleteCategoryService);
container.registerSingleton<CreateRecurrenceService>('CreateRecurrenceService', CreateRecurrenceService);
container.registerSingleton<ListRecurrencesService>('ListRecurrencesService', ListRecurrencesService);
container.registerSingleton<ProcessRecurrenceService>('ProcessRecurrenceService', ProcessRecurrenceService);
container.registerSingleton<GetDashboardOverviewService>('GetDashboardOverviewService', GetDashboardOverviewService);
container.registerSingleton<GetExpensesByCategoryService>('GetExpensesByCategoryService', GetExpensesByCategoryService);
container.registerSingleton<GetMonthlyEvolutionService>('GetMonthlyEvolutionService', GetMonthlyEvolutionService);
