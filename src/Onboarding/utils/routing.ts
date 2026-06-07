import type { OnboardingStatus, OnboardingStep } from '../../Auth/Store';

export function routeToOnboardingStep(
  step: OnboardingStep | null,
  status: OnboardingStatus | null,
): any {
  if (status === 'approved') return '/(tabs)/home';
  if (status === 'under_review' || status === 'rejected') return '/(auth)/onboarding-under-review';

  switch (step) {
    case 'SHOP_DETAILS':    return '/(auth)/onboarding-shop-details';
    case 'BUSINESS_TYPE':   return '/(auth)/onboarding-business-type';
    case 'IDENTITY_DOCS':   return '/(auth)/onboarding-identity-docs';
    case 'COMPLIANCE_DOCS': return '/(auth)/onboarding-compliance-docs';
    case 'BUSINESS_REGISTRATION': return '/(auth)/onboarding-business-registration';
    case 'INCORPORATION_DOCS': return '/(auth)/onboarding-incorporation-docs';
    case 'DIRECTORS_KYC':   return '/(auth)/onboarding-directors-kyc';
    case 'BANK_DETAILS':    return '/(auth)/onboarding-bank-details';
    case 'ADDRESS_PROOF':   return '/(auth)/onboarding-address-proof';
    case 'STORE_PHOTOS':    return '/(auth)/onboarding-store-photos';
    case 'SUBMIT':          return '/(auth)/onboarding-under-review';
    default:                return '/(auth)/onboarding-shop-details';
  }
}
