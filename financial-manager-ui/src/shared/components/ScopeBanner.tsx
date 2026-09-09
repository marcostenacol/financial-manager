import { useTranslation } from 'react-i18next';
import { useScope } from '../../contexts/useScope';

export const ScopeBanner = () => {
  const { scope } = useScope();
  const { t } = useTranslation();
  const isBusiness = scope === 'business';

  return (
    <div
      className={
        isBusiness
          ? 'sticky top-0 z-10 flex h-9 items-center gap-2 border-b border-app-border bg-app-biz-soft px-8 text-[11.5px] font-semibold text-app-biz'
          : 'sticky top-0 z-10 flex h-9 items-center gap-2 border-b border-app-border bg-app-accent-soft px-8 text-[11.5px] font-semibold text-app-accent'
      }
    >
      <span className="h-1.5 w-1.5 flex-none rounded-full bg-current" />
      <span>{isBusiness ? t('scope.bannerBusiness') : t('scope.bannerPersonal')}</span>
    </div>
  );
};
