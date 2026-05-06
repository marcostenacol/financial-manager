import { container } from 'tsyringe';

import { CacheTrait } from '@/base/traits/CacheTrait';

// Traits & Base
container.registerSingleton<CacheTrait>('CacheTrait', CacheTrait);

// Repositories
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { AuthRepository } from '@/modules/auth/repositories/AuthRepository';
import { ProfileRepositoryInterface } from '@/modules/profile/repositories/contracts/ProfileRepositoryInterface';
import { ProfileRepository } from '@/modules/profile/repositories/ProfileRepository';

container.registerSingleton<AuthRepositoryInterface>('AuthRepository', AuthRepository);
container.registerSingleton<ProfileRepositoryInterface>('ProfileRepository', ProfileRepository);

// Services
import { RegisterService } from '@/modules/auth/services/RegisterService';
import { LoginService } from '@/modules/auth/services/LoginService';
import { RefreshTokenService } from '@/modules/auth/services/RefreshTokenService';
import { LogoutService } from '@/modules/auth/services/LogoutService';
import { DetailProfileService } from '@/modules/profile/services/DetailProfileService';
import { UpdateProfileService } from '@/modules/profile/services/UpdateProfileService';
import { ChangeProfileTypeService } from '@/modules/profile/services/ChangeProfileTypeService';

container.registerSingleton<RegisterService>('RegisterService', RegisterService);
container.registerSingleton<LoginService>('LoginService', LoginService);
container.registerSingleton<RefreshTokenService>('RefreshTokenService', RefreshTokenService);
container.registerSingleton<LogoutService>('LogoutService', LogoutService);
container.registerSingleton<DetailProfileService>('DetailProfileService', DetailProfileService);
container.registerSingleton<UpdateProfileService>('UpdateProfileService', UpdateProfileService);
container.registerSingleton<ChangeProfileTypeService>('ChangeProfileTypeService', ChangeProfileTypeService);
