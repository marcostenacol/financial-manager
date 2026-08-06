export const CacheKeys = {
  auth: {
    token: (userId: string): string => `auth:token:${userId}`,
  },
  profile: {
    detail: (userId: string): string => `profile:user:${userId}`,
  },
  wallets: {
    list: (userId: string, scope?: string): string => `wallets:user:${userId}:${scope ?? 'all'}`,
    listPattern: (userId: string): string => `wallets:user:${userId}:*`,
    listAllPattern: (): string => `wallets:user:*`,
    detail: (walletId: string): string => `wallet:detail:${walletId}`,
  },
  categories: {
    list: (userId: string, scope?: string): string => `categories:user:${userId}:${scope ?? 'all'}`,
    listPattern: (userId: string): string => `categories:user:${userId}:*`,
    listAllPattern: (): string => `categories:user:*`,
  },
  costCenters: {
    list: (userId: string): string => `cost-centers:user:${userId}`,
    listAllPattern: (): string => `cost-centers:user:*`,
  },
  transactions: {
    list: (userId: string, filters?: unknown): string => `transactions:user:${userId}:${JSON.stringify(filters ?? {})}`,
    listPattern: (userId: string): string => `transactions:user:${userId}*`,
    byWallet: (walletId: string): string => `transactions:wallet:${walletId}`,
    byWalletPattern: (walletId: string): string => `transactions:wallet:${walletId}*`,
    detail: (transactionId: string): string => `transaction:detail:${transactionId}`,
  },
  recurrences: {
    list: (userId: string): string => `recurrences:user:${userId}`,
  },
  savingsGoals: {
    list: (userId: string): string => `savings-goals:user:${userId}`,
  },
  notifications: {
    list: (userId: string): string => `notifications:user:${userId}`,
  },
  reports: {
    overview: (userId: string, range?: { start_date?: string; end_date?: string }, scope?: string): string =>
      `reports:overview:${userId}:${range?.start_date ?? ''}:${range?.end_date ?? ''}:${scope ?? 'all'}`,
    overviewPattern: (userId: string): string => `reports:overview:${userId}:*`,
    cashFlowByCostCenter: (userId: string, month: number, year: number, range?: { start_date?: string; end_date?: string }): string =>
      `reports:cash-flow-cost-center:${userId}:${month}:${year}:${range?.start_date ?? ''}:${range?.end_date ?? ''}`,
    cashFlowByCostCenterPattern: (userId: string): string => `reports:cash-flow-cost-center:${userId}:*`,
    expensesByCategory: (userId: string, month: number, year: number, range?: { start_date?: string; end_date?: string }): string =>
      `reports:expenses-category:${userId}:${month}:${year}:${range?.start_date ?? ''}:${range?.end_date ?? ''}`,
    expensesByCategoryPattern: (userId: string): string => `reports:expenses-category:${userId}:*`,
    monthlyEvolution: (userId: string, range?: { start_date?: string; end_date?: string }): string =>
      `reports:monthly-evolution:${userId}:${range?.start_date ?? ''}:${range?.end_date ?? ''}`,
  },
} as const;
