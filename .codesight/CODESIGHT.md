# frontend — AI Context Map

> **Stack:** angular | none | angular | typescript

> 4 routes (4 inferred) | 0 models | 143 components | 218 lib files | 6 env vars | 18 middleware | 3 events | 25% test coverage
> **Token savings:** this file is ~17,500 tokens. Without it, AI exploration would cost ~120,400 tokens. **Saves ~102,900 tokens per conversation.**
> **Last scanned:** 2026-07-16 13:13 — re-run after significant changes

---

# Routes

- `GET` `/auth-response` [auth] `[inferred]`
- `GET` `/` [auth] `[inferred]` ✓
- `GET` `/:dataProductId` params(dataProductId) [auth] `[inferred]`
- `GET` `/**` [auth] `[inferred]`

---

# Components

- **AppComponent** [client] — `src/app/app.component.ts`
- **DefaultLayoutComponent** [client] — `src/app/layout/default-layout.component.ts`
- **FullWidthLayoutComponent** [client] — `src/app/layout/full-width-layout.component.ts`
- **DataRequestAdvantagesComponent** [client] — props: advantages, lang — `src/data-request-advantages/data-request-advantages.component.ts`
- **BlockRendererComponent** [client] — props: block, index, isDynamicPage — `src/features/cms-blocks/cms-block-renderer.component.ts`
- **DebugModalComponent** [client] — `src/features/debug/debug-modal.component.ts`
- **LanguageSelectComponent** [client] — `src/features/language-select/language-select.component.ts`
- **AdminPage** [client] — `src/pages/admin-page/admin.page.ts`
- **AgbPage** [client] — `src/pages/agb-page/agb-page.page.ts`
- **CmsPage** [client] — props: slug — `src/pages/cms-page/cms-page.page.ts`
- **ConsentRequestProducerPage** [client] — `src/pages/consent-request-producer/consent-request-producer.page.ts`
- **DataProductsPageComponent** [client] — `src/pages/data-products-page/data-products-page.component.ts`
- **DataRequestsConsumerPage** [client] — `src/pages/data-requests-consumer/data-requests-consumer.page.ts`
- **DataRequestsProviderPage** [client] — `src/pages/data-requests-provider/data-requests-provider.page.ts`
- **ErrorPage** [client] — `src/pages/error-page/error-page.component.ts`
- **ExternalServiceErrorPage** [client] — `src/pages/external-service-error/external-service-error.page.ts`
- **ForbiddenPage** [client] — `src/pages/forbidden/forbidden.page.ts`
- **ImprintPage** [client] — `src/pages/imprint-page/imprint-page.page.ts`
- **LandingPage** [client] — `src/pages/landing-page/landing-page.page.ts`
- **MaintenancePage** [client] — `src/pages/maintenance/maintenance.page.ts`
- **NotFoundPage** [client] — `src/pages/not-found/not-found.page.ts`
- **NotificationCenterPageComponent** [client] — `src/pages/notification-center-page/notification-center-page.component.ts`
- **OnboardingPage** [client] — `src/pages/onboarding-page/onboarding-page.page.ts`
- **PrivacyPolicyPage** [client] — `src/pages/privacy-policy-page/privacy-policy-page.page.ts`
- **SupporterPageComponent** [client] — `src/pages/supporter-page/supporter-page.component.ts`
- **ErrorAlertList** [client] — props: errors — `src/shared/error-alert-list/error-alert-list.component.ts`
- **ErrorOutletComponent** [client] — `src/shared/error-alert-outlet/error-outlet.component.ts`
- **ErrorModal** [client] — `src/shared/error-modal/error-modal.component.ts`
- **SidepanelComponent** [client] — props: backgroundColor, dataTestId, isOpen, maxWidth, preventManualClose, title, subTitle — `src/shared/sidepanel/sidepanel.component.ts`
- **DummyComponent** [client] — `src/shared/testing/mocks/dummy-components.ts`
- **AgridataAvatarComponent** [client] — props: name, imageUrl, size, skin — `src/shared/ui/agridata-avatar/agridata-avatar.component.ts`
- **AgridataClientTableComponent** [client] — props: pageSize, enableSearch, loading — `src/shared/ui/agridata-client-table/agridata-client-table.component.ts`
- **AgridataDigitInputComponent** [client] — props: control, length, isViewMode — `src/shared/ui/agridata-digit-input/agridata-digit-input.component.ts`
- **AgridataDropzoneComponent** [client] — props: accept, ariaDescribedBy, disabled, multiple, label, hint — `src/shared/ui/agridata-dropzone/agridata-dropzone.component.ts`
- **AgridataInputComponent** [client] — props: id, control, type, placeholder, maxCharacters, hasError, inputPrefix, inputPrefixIcon, isViewMode, disabled — `src/shared/ui/agridata-input/agridata-input.component.ts`
- **AgridataMultiSelectOptionComponent** [client] — props: control, option, disabled — `src/shared/ui/agridata-multi-select/agridata-multi-select-option/agridata-multi-select-option.component.ts`
- **AgridataMultiSelectComponent** [client] — props: categories, control, customClass, disabled, enableSearch, hasError, options, placeholder, singleCategorySelection, isViewMode — `src/shared/ui/agridata-multi-select/agridata-multi-select.component.ts`
- **AgridataRadioGroupComponent** [client] — props: ariaLabel, control, disabled, name, options — `src/shared/ui/agridata-radio-group/agridata-radio-group.component.ts`
- **AgridataSelectComponent** [client] — props: control, customClass, isViewMode, disabled, hasError, options, placeholder — `src/shared/ui/agridata-select/agridata-select.component.ts`
- **AgridataTableComponent** [client] — props: enableSearch — `src/shared/ui/agridata-table/agridata-table.component.ts`
- **TableCellComponent** [client] — props: row — `src/shared/ui/agridata-table/table-cell/table-cell.component.ts`
- **TableHeaderCellComponent** [client] — props: sortDirection — `src/shared/ui/agridata-table/table-header-cell/table-header-cell.component.ts`
- **TablePaginationComponent** [client] — props: currentPageIndex, totalPages, pageSize — `src/shared/ui/agridata-table/table-pagination/table-pagination.component.ts`
- **TableRowMenuComponent** [client] — props: actions, dataTestId — `src/shared/ui/agridata-table/table-row-menu/table-row-menu.component.ts`
- **AgridataTabsComponent** [client] — props: tabs — `src/shared/ui/agridata-tabs/agridata-tabs.component.ts`
- **AgridataTextareaComponent** [client] — props: control, id, placeholder, maxCharacters, hasError, isViewMode, disabled — `src/shared/ui/agridata-textarea/agridata-textarea.component.ts`
- **AgridataToggleComponent** [client] — props: ariaLabel, disabled, label — `src/shared/ui/agridata-toggle/agridata-toggle.component.ts`
- **AgridataWysiwygComponent** [client] — props: control, id, placeholder, maxCharacters, hasError, isViewMode, disabled — `src/shared/ui/agridata-wysiwyg/agridata-wysiwyg.component.ts`
- **AgridataBadgeComponent** [client] — props: text, variant, size — `src/shared/ui/badge/agridata-badge.component.ts`
- **ButtonComponent** [client] — props: variant, type, disabled, tabindex, ariaLabel, selected, loading, success, disabledInfo, tooltip — `src/shared/ui/button/button.component.ts`
- **EmptyStateComponent** [client] — props: title, message, additionalInfo — `src/shared/ui/empty-state/empty-state.component.ts`
- **AgridataFileDownloadComponent** [client] — props: fileName, sizeBytes, isOpening, downloadable, isDownloading, downloadLabel, removable, markedForRemoval, badgeText, badgeVariant — `src/shared/ui/file-download/agridata-file-download.component.ts`
- **FormControlComponent** [client] — props: categories, control, controlType, disabled, helperText, id, inputPrefix, label, options, pattern — `src/shared/ui/form-control/form-control.component.ts`
- **ModalComponent** [client] — props: title, showCloseButton, dataTestId — `src/shared/ui/modal/modal.component.ts`
- **PopoverComponent** [client] — props: isOpen, class — `src/shared/ui/popover/popover.component.ts`
- **ProgressBarComponent** [client] — props: label, value — `src/shared/ui/progress-bar/progress-bar.component.ts`
- **SearchInputComponent** [client] — props: minSearchLength, debounceTime, isLoading — `src/shared/ui/search-input/search-input.component.ts`
- **ToastStoryWrapperComponent** [client] — `src/shared/ui/toast/toast.component.stories.ts`
- **ToastComponent** [client] — `src/shared/ui/toast/toast.component.ts`
- **AccountOverlayComponent** [client] — props: userInfo — `src/widgets/account-overlay/account-overlay.component.ts`
- **AdminDataRequestDetailsComponent** [client] — props: dataRequestId — `src/widgets/admin-data-request-details/admin-data-request-details.component.ts`
- **AdminDataRequestTableComponent** [client] — props: dataRequests — `src/widgets/admin-data-request-table/admin-data-request-table.component.ts`
- **AgridataAccordionComponent** [client] — props: header, isLarge — `src/widgets/agridata-accordion/agridata-accordion.component.ts`
- **AgridataContactCardComponent** [client] — props: name, secondaryName, imageUrl, size, skin — `src/widgets/agridata-contact-card/agridata-contact-card.component.ts`
- **AgridataWizardStepperComponent** [client] — props: steps, currentStep — `src/widgets/agridata-wizard/agridata-wizard-stepper/agridata-wizard-stepper.component.ts`
- **AgridataWizardComponent** [client] — props: steps — `src/widgets/agridata-wizard/agridata-wizard.component.ts`
- **AlertComponent** [client] — props: type, showCloseButton, dataTestId, title, message, additionalInfo — `src/widgets/alert/alert.component.ts`
- **CardBlockComponent** [client] — props: card, size, bgColorClass — `src/widgets/cms-blocks/card-block/card-block.component.ts`
- **CmsFooterBlockComponent** [client] — props: block — `src/widgets/cms-blocks/cms-footer-block/cms-footer-block.component.ts`
- **HeroBlockComponent** [client] — props: block — `src/widgets/cms-blocks/hero-block/hero-block.component.ts`
- **ImageCardBlockComponent** [client] — props: block — `src/widgets/cms-blocks/image-card-block/image-card-block.component.ts`
- **ImageGridBlockComponent** [client] — props: block — `src/widgets/cms-blocks/image-grid-block/image-grid-block.component.ts`
- **ImageListBlockComponent** [client] — props: block — `src/widgets/cms-blocks/image-list-block/image-list-block.component.ts`
- **ListBlockComponent** [client] — props: list, cols — `src/widgets/cms-blocks/list-block/list-block.component.ts`
- **SectionCardGridBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-card-grid-block/section-card-grid-block.component.ts`
- **SectionContactFormBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-contact-form-block/section-contact-form-block.component.ts`
- **SectionFaqBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-faq-block/section-faq-block.component.ts`
- **SectionImageCardBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-image-card-block/section-image-card-block.component.ts`
- **SectionImageListComponent** [client] — props: block — `src/widgets/cms-blocks/section-image-list/section-image-list.component.ts`
- **SectionMediaBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-media-block/section-media-block.component.ts`
- **SectionOnboardingFormBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-onboarding-form-block/section-onboarding-form-block.component.ts`
- **SectionTextImageBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-text-image-block/section-text-image-block.component.ts`
- **SectionTimelineComponent** [client] — props: block — `src/widgets/cms-blocks/section-timeline/section-timeline.component.ts`
- **SectionUserFeedbackBlockComponent** [client] — props: block — `src/widgets/cms-blocks/section-user-feedback-block/section-user-feedback-block.component.ts`
- **TextImageBlockComponent** [client] — props: block — `src/widgets/cms-blocks/text-image-block/text-image-block.component.ts`
- **TimelineCardComponent** [client] — props: block, lastItem, index — `src/widgets/cms-blocks/timeline-card/timeline-card.component.ts`
- **UserFeedbackBlockComponent** [client] — props: block — `src/widgets/cms-blocks/user-feedback-block/user-feedback-block.component.ts`
- **ConsentRequestDetailsComponent** [client] — props: consentRequestId — `src/widgets/consent-request-details/consent-request-details.component.ts`
- **ConsentRequestEmptyStateComponent** [client] — `src/widgets/consent-request-empty-state/consent-request-empty-state.component.ts`
- **ConsentRequestFilterComponent** [client] — props: requests — `src/widgets/consent-request-table/consent-request-filter/consent-request-filter.component.ts`
- **ConsentRequestListComponent** [client] — props: consentRequests — `src/widgets/consent-request-table/consent-request-list/consent-request-list.component.ts`
- **ConsentRequestTableComponent** [client] — props: consentRequestId, consentRequests — `src/widgets/consent-request-table/consent-request-table.component.ts`
- **ConsentRequestsTourIntroComponent** [client] — `src/widgets/consent-requests-tour/consent-requests-tour-intro/consent-requests-tour-intro.component.ts`
- **ConsentRequestsTourTriggerComponent** [client] — `src/widgets/consent-requests-tour/consent-requests-tour-trigger/consent-requests-tour-trigger.component.ts`
- **ContactSupportInfoContentComponent** [client] — `src/widgets/contact-support-info/contact-support-info-content/contact-support-info-content.component.ts`
- **ContactSupportInfoComponent** [client] — `src/widgets/contact-support-info/contact-support-info.component.ts`
- **CookiebannerComponent** [client] — `src/widgets/cookiebanner/cookiebanner.component.ts`
- **DataProductDetailFormComponent** [client] — props: dataProductId — `src/widgets/data-product-detail-form/data-product-detail-form.component.ts`
- **DataProductDetailInfoComponent** [client] — props: form, isViewMode — `src/widgets/data-product-detail-form/data-product-detail-info/data-product-detail-info.component.ts`
- **DataProductDetailDocumentsComponent** [client] — props: form, isViewMode — `src/widgets/data-product-detail-form/data-product-detail-links-documents/data-product-detail-documents/data-product-detail-documents.component.ts`
- **DataProductDetailLinksDocumentsComponent** [client] — props: form, isViewMode — `src/widgets/data-product-detail-form/data-product-detail-links-documents/data-product-detail-links-documents.component.ts`
- **DataProductDetailTechnicalComponent** [client] — props: form, isViewMode, preselectedProviderId — `src/widgets/data-product-detail-form/data-product-detail-technical/data-product-detail-technical.component.ts`
- **DataProductLinksComponent** [client] — props: form, formDisabled — `src/widgets/data-product-links/data-product-links.component.ts`
- **DataRequestCompletionSignatureComponent** [client] — props: signature, position — `src/widgets/data-request-completion/data-request-completion-signature/data-request-completion-signature.component.ts`
- **DataRequestCompletionSigningStatusComponent** [client] — props: contract, dataRequestStateCode — `src/widgets/data-request-completion/data-request-completion-signing-status/data-request-completion-signing-status.component.ts`
- **DataRequestCompletionComponent** [client] — props: dataRequest, hasReleasedToProvider — `src/widgets/data-request-completion/data-request-completion.component.ts`
- **DataRequestContactComponent** [client] — props: phoneNumber, email, organisationName, lang — `src/widgets/data-request-contact/data-request-contact.component.ts`
- **DataRequestContractPdfComponent** [client] — props: dataRequest, contractRevisionId — `src/widgets/data-request-contract-pdf/data-request-contract-pdf.component.ts`
- **DataRequestContractSignaturePolicyComponent** [client] — props: dataRequest, contract, disabled — `src/widgets/data-request-contract-signature-policy/data-request-contract-signature-policy.component.ts`
- **ContractSignatureInputComponent** [client] — props: contractId, existingSignature, slotId, showWaitingState — `src/widgets/data-request-contract-signing/contract-signature-input/contract-signature-input.component.ts`
- **DataRequestContractSigningComponent** [client] — props: dataRequest — `src/widgets/data-request-contract-signing/data-request-contract-signing.component.ts`
- **DataRequestDetailsRequestComponent** [client] — props: dataRequest, isRedirectUriRegexEditable — `src/widgets/data-request-details/data-request-details-request/data-request-details-request.component.ts`
- **DataRequestDetailsComponent** [client] — props: autoOpenUnsealedContractTab, dataRequestId, isRedirectUriRegexEditable — `src/widgets/data-request-details/data-request-details.component.ts`
- **DataRequestDetailsContractComponent** [client] — props: dataRequest — `src/widgets/data-request-details-contract/data-request-details-contract.component.ts`
- **DataRequestDetailsWrapperComponent** [client] — props: dataRequestId — `src/widgets/data-request-details-wrapper/data-request-details-wrapper.component.ts`
- **DataRequestFormConsumerComponent** [client] — props: form, formDisabled, dataRequestLogo — `src/widgets/data-request-form/data-request-form-consumer/data-request-form-consumer.component.ts`
- **DataRequestFormContractComponent** [client] — props: dataRequest — `src/widgets/data-request-form/data-request-form-contract/data-request-form-contract.component.ts`
- **DataRequestFormProducerComponent** [client] — props: form, formDisabled — `src/widgets/data-request-form/data-request-form-producer/data-request-form-producer.component.ts`
- **DataRequestFormRequestAdvantagesComponent** [client] — props: form, formDisabled — `src/widgets/data-request-form/data-request-form-request/data-request-form-request-advantages/data-request-form-request-advantages.component.ts`
- **DataRequestFormRequestDescriptionComponent** [client] — props: form, formDisabled — `src/widgets/data-request-form/data-request-form-request/data-request-form-request-description/data-request-form-request-description.component.ts`
- **DataRequestFormRequestProductComponent** [client] — props: dataProviderId, form, formDisabled — `src/widgets/data-request-form/data-request-form-request/data-request-form-request-product/data-request-form-request-product.component.ts`
- **DataRequestFormRequestComponent** [client] — props: dataProviderId, form, formDisabled — `src/widgets/data-request-form/data-request-form-request/data-request-form-request.component.ts`
- **DataRequestPreviewComponent** [client] — props: dataRequest — `src/widgets/data-request-preview/data-request-preview.component.ts`
- **DataRequestPrivacyInfosComponent** [client] — props: dataConsumerName, dataProvider, lang — `src/widgets/data-request-privacy-infos/data-request-privacy-infos.component.ts`
- **DataRequestProviderTableComponent** [client] — props: dataRequests — `src/widgets/data-request-provider-table/data-request-provider-table.component.ts`
- **DataRequestPurposeAccordionComponent** [client] — props: purpose, products, lang — `src/widgets/data-request-purpose-accordion/data-request-purpose-accordion.component.ts`
- **DataRequestRedirectUriComponent** [client] — props: dataRequest, isValidRedirectUriRegexEditable — `src/widgets/data-request-redirect-uri/data-request-redirect-uri.component.ts`
- **DataRequestTableComponent** [client] — props: dataRequests — `src/widgets/data-request-table/data-request-table.component.ts`
- **DataRequestWizardConsumerComponent** [client] — `src/widgets/data-request-wizard/data-request-wizard-consumer/data-request-wizard-consumer.component.ts`
- **DataRequestWizardProviderComponent** [client] — `src/widgets/data-request-wizard/data-request-wizard-provider/data-request-wizard-provider.component.ts`
- **DataRequestWizardComponent** [client] — props: dataRequestId, initialDataRequest, isLoading — `src/widgets/data-request-wizard/data-request-wizard.component.ts`
- **ErrorAlertComponent** [client] — props: error — `src/widgets/error-alert/error-alert.component.ts`
- **FooterWidgetComponent** [client] — `src/widgets/footer-widget/ui/footer-widget.component.ts`
- **HeaderWidgetComponent** [client] — `src/widgets/header-widget/header-widget.component.ts`
- **MobileNavigationWidgetComponent** [client] — props: cmsPages — `src/widgets/navigation-widget/mobile-navigation-widget/mobile-navigation-widget.component.ts`
- **NavigationWidgetComponent** [client] — props: cmsPages — `src/widgets/navigation-widget/navigation-widget.component.ts`
- **NewYearBannerComponent** [client] — `src/widgets/new-year-banner/new-year-banner.component.ts`
- **NotificationOverlayContentComponent** [client] — props: notifications — `src/widgets/notification-overlay/notification-overlay-content/notification-overlay-content.component.ts`
- **NotificationOverlayComponent** [client] — `src/widgets/notification-overlay/notification-overlay.component.ts`
- **ProviderDataRequestDetailsComponent** [client] — props: dataRequestId — `src/widgets/provider-data-request-details/provider-data-request-details.component.ts`
- **SliderComponent** [client] — `src/widgets/slider/slider.component.ts`
- **SupporterOverlayComponent** [client] — `src/widgets/supporter-overlay/supporter-overlay.component.ts`
- **UidSwitchComponent** [client] — props: additionalClass, variant — `src/widgets/uid-switch/uid-switch.component.ts`

---

# Libraries

- `src/data-request-advantages/data-request-advantages.component.ts` — class DataRequestAdvantagesComponent
- `src/entities/api/agridata-state.service.ts` — class AgridataStateService, const DISMISSED_MIGRATIONS_KEY
- `src/entities/api/backend-info.service.ts` — class BackendInfoService
- `src/entities/api/consent-request.service.ts` — class ConsentRequestService
- `src/entities/api/contract-revision.service.ts` — class ContractRevisionService
- `src/entities/api/data-product-document.service.ts` — class DataProductDocumentService
- `src/entities/api/data-product.service.ts` — class DataProductService
- `src/entities/api/data-providers.service.ts` — class DataProvidersService
- `src/entities/api/data-request.service.ts` — class DataRequestService
- `src/entities/api/master-data.service.ts` — class MasterDataService
- `src/entities/api/notification.service.ts` — class NotificationService
- `src/entities/api/uid-register.service.ts` — class UidRegisterService
- `src/entities/api/user.service.ts` — class UserService
- `src/entities/cms/cms.service.ts` — class CmsService
- `src/entities/openapi/api/bITSignatureTest.service.ts` — class BITSignatureTestService
- `src/entities/openapi/api/consentRequestAggregations.service.ts` — class ConsentRequestAggregationsService
- `src/entities/openapi/api/consentRequests.service.ts` — class ConsentRequestsService
- `src/entities/openapi/api/contractRevisions.service.ts` — class ContractRevisionsService
- `src/entities/openapi/api/dataProducts.service.ts` — class DataProductsService
- `src/entities/openapi/api/dataProviders.service.ts` — class DataProvidersService
- `src/entities/openapi/api/dataRequests.service.ts` — class DataRequestsService
- `src/entities/openapi/api/dataTransfer.service.ts` — class DataTransferService
- `src/entities/openapi/api/dataTransferV2.service.ts` — class DataTransferV2Service
- `src/entities/openapi/api/infoResource.service.ts` — class InfoResourceService
- `src/entities/openapi/api/notifications.service.ts` — class NotificationsService
- `src/entities/openapi/api/testData.service.ts` — class TestDataService
- `src/entities/openapi/api/uIDRegisterSearch.service.ts` — class UIDRegisterSearchService
- `src/entities/openapi/api/users.service.ts` — class UsersService
- `src/entities/openapi/api.base.service.ts` — class BaseService
- `src/entities/openapi/api.module.ts` — class ApiModule
- `src/entities/openapi/configuration.ts` — class Configuration, interface ConfigurationParameters
- `src/entities/openapi/encoder.ts` — class CustomHttpParameterCodec
- `src/features/cms-blocks/cms-block-renderer.component.ts` — class BlockRendererComponent
- `src/features/debug/debug-modal.component.ts` — class DebugModalComponent
- `src/features/debug/debug.service.ts`
  - class DebugService
  - interface RequestInfo
  - interface ResponseInfo
- `src/features/language-select/language-select.component.ts` — class LanguageSelectComponent
- `src/shared/click-outside/click-outside.directive.ts` — class ClickOutsideDirective
- `src/shared/click-stop-propagation/click-stop-propagation.directive.ts` — class ClickStopPropagationDirective
- `src/shared/consent-request/consent-request.utils.ts`
  - function getToastTitle: (stateCode) => void
  - function getToastMessage: (stateCode) => void
  - function getToastType: (stateCode) => void
  - function getUndoAction: (undoAction) => void
  - function buildConsentRequestTourSteps: (i18nService, injector) => DriveStep[]
- `src/shared/data-product/data-product-dto.directive.ts` — class DataProductDtoDirective
- `src/shared/data-request/data-request-dto.directive.ts` — class DataRequestDtoDirective
- `src/shared/data-request/data-request.utils.ts` — function getBadgeVariant: (stateCode?) => void, function getFieldFromLang: (field, lang, dataRequest) => void
- `src/shared/date/agridata-date.pipe.ts` — class AgridataDatePipe
- `src/shared/date/date-utils.ts` — function formatDate: (value) => string | undefined
- `src/shared/error-alert-list/error-alert-list.component.ts` — class ErrorAlertList
- `src/shared/error-alert-outlet/error-outlet.component.ts` — class ErrorOutletComponent
- `src/shared/error-modal/error-modal.component.ts` — class ErrorModal
- `src/shared/forms/cross-field-group.directive.ts` — class CrossFieldGroupDirective
- `src/shared/forms/cross-field.validators.ts`
  - function hasText: (value) => boolean
  - function crossFieldValidation: (control) => ValidationErrors | null
  - function revalidateCrossFieldGroup: (group) => void
- `src/shared/i18n/i18n.directive.ts` — class I18nDirective
- `src/shared/i18n/i18n.pipe.ts` — class I18nPipe, type OrArray
- `src/shared/i18n/i18n.service.ts` — class I18nService
- `src/shared/lib/api.helper.ts`
  - function arrayToObjectSortParams: (sortParams, paramName) => void
  - function createResourceErrorHandlerEffect: (resource, errorService) => void
  - function createResourceValueComputed: (resource, fallbackValue) => Signal<T>
  - interface PageResponseDto
- `src/shared/lib/auth/auth.guard.ts` — class AuthorizationGuard
- `src/shared/lib/auth/auth.service.ts` — class AuthService
- `src/shared/lib/cms/cms.utils.ts`
  - function generateMediaUrl
  - function isVideo
  - function contractAgbUrl
- `src/shared/lib/form.helper.ts`
  - function buildItemGroup: (itemSchema, i18nService, isRichText) => FormGroup
  - function buildReactiveForm: (jsonSchema, fieldMaps, i18nService) => void
  - function getErrorMessage: (control, errorKey) => void
  - function getFormControl: (form, key) => void
  - function getFormArray: (form, key) => void
  - function getFormControlWithMessages: (form, key) => FormControlWithMessages
  - _...10 more_
- `src/shared/markdown/markdown.pipe.ts` — class MarkdownPipe
- `src/shared/notification/notification.util.ts`
  - function getNotificationRoute: (notification, authService, 'isConsumer' | 'isDataProvider' | 'isAdmin'>) => string | null
  - function getRouteForTarget: (targetType, targetId, authService, 'isConsumer' | 'isDataProvider' | 'isAdmin'>) => string | null
  - function toggleReadStatus: (notification, notificationService, 'toggleReadStatus' | 'notifyMutation'>, toastService, 'show'>, i18nService, 'translate'>) => Promise<void>
  - function markAllAsRead: (notifications, notificationService, 'markAllAsRead' | 'notifyMutation'>, toastService, 'show'>, i18nService, 'translate'>) => Promise<void>
- `src/shared/product-tour/product-tour.service.ts` — class ProductTourService
- `src/shared/scroll-fade/scroll-fade.directive.ts` — class ScrollFadeDirective
- `src/shared/seo/seo.service.ts` — class SeoService
- `src/shared/sidepanel/sidepanel.component.ts` — class SidepanelComponent
- `src/shared/testing/mocks/dummy-components.ts` — class DummyComponent
- `src/shared/testing/mocks/mock-activated-route.ts` — function createMockActivatedRoute: (queryParams, string>, params, string>) => MockActivatedRoute, interface MockActivatedRoute
- `src/shared/testing/mocks/mock-agridata-state-service.ts`
  - function createMockAgridataStateService: () => MockAgridataStateService
  - type MockAgridataStateServiceTestSignals
  - type MockAgridataStateService
  - const BE_VERSION
  - const mockUids
- `src/shared/testing/mocks/mock-analytics-service.ts` — function createMockAnalyticsService: () => MockAnalyticsService, type MockAnalyticsService
- `src/shared/testing/mocks/mock-auth-service.ts`
  - function createMockAuthService: () => MockAuthService
  - type MockAuthServiceTestSignals
  - type MockAuthService
  - const mockUserInfo: UserInfoDto
- `src/shared/testing/mocks/mock-cms-service.ts`
  - function createMockCmsService: () => MockCmsService
  - type MockCmsService
  - const mockCmsResponse
  - const mockCmsService
- `src/shared/testing/mocks/mock-consent-request-service.ts`
  - function createMockConsentRequestService: () => MockConsentRequestService
  - type MockConsentRequestService
  - const mockConsentRequests: ConsentRequestProducerViewDto[]
- `src/shared/testing/mocks/mock-contract-revision-service.ts`
  - function createMockContractRevisionService: () => MockContractRevisionService
  - type MockContractRevisionService
  - const mockOtpChallenge: OtpChallengeDto
  - const mockContractRevision: ContractRevisionDto
- `src/shared/testing/mocks/mock-data-product-document-service.ts` — function createMockDataProductDocumentService: () => MockDataProductDocumentService, type MockDataProductDocumentService
- `src/shared/testing/mocks/mock-data-product-service.ts` — function createMockDataProductService: () => MockDataProductService, type MockDataProductService
- `src/shared/testing/mocks/mock-data-providers-service.ts` — function createMockDataProvidersService: () => MockDataProvidersService, type MockDataProvidersService
- `src/shared/testing/mocks/mock-data-request-service.ts`
  - function createMockDataRequestService: () => MockDataRequestService
  - type MockDataRequestService
  - const mockDataRequests: DataRequestDto[]
- `src/shared/testing/mocks/mock-document.ts`
  - function createMockDocument: (location) => MockDocumentResult
  - interface MockLocation
  - interface MockDocumentResult
- `src/shared/testing/mocks/mock-error-handler.service.ts` — function createMockErrorHandlerService: () => MockErrorHandlerService, type MockErrorHandlerService
- `src/shared/testing/mocks/mock-i18n-service.ts` — function createMockI18nService: () => MockI18nService, type MockI18nService
- `src/shared/testing/mocks/mock-local-store.ts` — function installMockLocalStorage: (initial) => void, type LocalStore
- `src/shared/testing/mocks/mock-master-data-service.ts`
  - function createMockMasterDataService: () => MockMasterDataService
  - type MockMasterDataServiceTestSignals
  - type MockMasterDataService
- `src/shared/testing/mocks/mock-notification-service.ts`
  - function createMockNotificationService: () => MockNotificationService
  - type MockNotificationService
  - const mockInboxEntries: InboxEntryDto[]
  - const mockHeaderNotifications: PageResponseDtoInboxEntryDto
- `src/shared/testing/mocks/mock-product-tour.service.ts` — function createMockProductTourService: () => MockProductTourService, type MockProductTourService
- `src/shared/testing/mocks/mock-resources.ts` — class MockResources
- `src/shared/testing/mocks/mock-title-service.ts`
  - function createMockTitleService: () => MockTitleService
  - type MockTitleServiceSignals
  - type MockTitleService
- `src/shared/testing/mocks/mock-toast-service.ts` — function createMockToastService: () => MockToastService, type MockToastService
- `src/shared/testing/mocks/mock-uid-register-service.ts` — function createMockUidRegisterService: () => MockUidRegisterService, type MockUidRegisterService
- `src/shared/testing/mocks/mock-user-service.ts`
  - function createMockUserService: () => MockUserService
  - type MockUserService
  - const mockUserService
- `src/shared/testing/transloco-testing.module.ts` — function createTranslocoTestingModule: (options) => void
- `src/shared/toast/toast.service.ts` — class ToastService
- `src/shared/tooltip/tooltip.directive.ts` — class TooltipDirective
- `src/shared/ui/agridata-avatar/agridata-avatar.component.ts` — class AgridataAvatarComponent
- `src/shared/ui/agridata-client-table/agridata-client-table.component.ts` — class AgridataClientTableComponent
- `src/shared/ui/agridata-digit-input/agridata-digit-input.component.ts` — class AgridataDigitInputComponent
- `src/shared/ui/agridata-dropzone/agridata-dropzone.component.ts` — class AgridataDropzoneComponent
- `src/shared/ui/agridata-input/agridata-input.component.ts` — class AgridataInputComponent
- `src/shared/ui/agridata-multi-select/agridata-multi-select-option/agridata-multi-select-option.component.ts` — class AgridataMultiSelectOptionComponent
- `src/shared/ui/agridata-multi-select/agridata-multi-select.component.ts` — class AgridataMultiSelectComponent
- `src/shared/ui/agridata-radio-group/agridata-radio-group.component.ts` — class AgridataRadioGroupComponent
- `src/shared/ui/agridata-select/agridata-select.component.ts` — class AgridataSelectComponent
- `src/shared/ui/agridata-table/agridata-table.component.ts` — class AgridataTableComponent
- `src/shared/ui/agridata-table/table-cell/table-cell.component.ts` — class TableCellComponent
- `src/shared/ui/agridata-table/table-header-cell/table-header-cell.component.ts` — class TableHeaderCellComponent
- `src/shared/ui/agridata-table/table-pagination/table-pagination.component.ts` — class TablePaginationComponent
- `src/shared/ui/agridata-table/table-row-menu/table-row-menu.component.ts` — class TableRowMenuComponent, interface ActionDTO
- `src/shared/ui/agridata-tabs/agridata-tabs.component.ts` — class AgridataTabsComponent
- `src/shared/ui/agridata-textarea/agridata-textarea.component.ts` — class AgridataTextareaComponent
- `src/shared/ui/agridata-toggle/agridata-toggle.component.ts` — class AgridataToggleComponent
- `src/shared/ui/agridata-wysiwyg/agridata-wysiwyg.component.ts` — class AgridataWysiwygComponent
- `src/shared/ui/badge/agridata-badge.component.ts`
  - class AgridataBadgeComponent
  - enum BadgeVariant
  - enum BadgeSize
- `src/shared/ui/button/button.component.ts` — class ButtonComponent
- `src/shared/ui/empty-state/empty-state.component.ts` — class EmptyStateComponent
- `src/shared/ui/file-download/agridata-file-download.component.ts` — class AgridataFileDownloadComponent
- `src/shared/ui/form-control/form-control.component.ts` — class FormControlComponent
- `src/shared/ui/modal/modal.component.ts` — class ModalComponent
- `src/shared/ui/popover/popover.component.ts` — class PopoverComponent
- `src/shared/ui/progress-bar/progress-bar.component.ts` — class ProgressBarComponent
- `src/shared/ui/search-input/search-input.component.ts` — class SearchInputComponent
- `src/shared/ui/toast/toast.component.ts` — class ToastComponent
- `src/shared/utils/download.util.ts` — function downloadBlob: (blob, fileName) => void, function openBlobInNewTab: (blob, mimeType?) => void
- `src/shared/utils/file-icon.util.ts` — function getFileIcon: (fileName) => IconDefinition
- `src/shared/utils/format.util.ts` — function formatBytes: (bytes) => string
- `src/shared/utils/ui.util.ts`
  - function calculateVerticalPlacement: (triggerRect, contentHeight, viewportHeight) => VerticalPlacement
  - function copyToClipboard: (text) => Promise<void>
  - function startCountdown: (countdownValue, durationSeconds, existingTimer?) => ReturnType<typeof setInterval>
  - enum VerticalPlacement
- `src/shared/view-section/view-section.directive.ts` — class ViewSectionDirective
- `src/widgets/account-overlay/account-overlay.component.ts` — class AccountOverlayComponent
- `src/widgets/admin-data-request-details/admin-data-request-details.component.ts` — class AdminDataRequestDetailsComponent
- `src/widgets/admin-data-request-table/admin-data-request-table.component.ts` — class AdminDataRequestTableComponent
- `src/widgets/agridata-accordion/agridata-accordion.component.ts` — class AgridataAccordionComponent
- `src/widgets/agridata-contact-card/agridata-contact-card.component.ts` — class AgridataContactCardComponent
- `src/widgets/agridata-wizard/agridata-wizard-stepper/agridata-wizard-stepper.component.ts` — class AgridataWizardStepperComponent
- `src/widgets/agridata-wizard/agridata-wizard.component.ts` — class AgridataWizardComponent
- `src/widgets/alert/alert.component.ts` — class AlertComponent
- `src/widgets/cms-blocks/card-block/card-block.component.ts` — class CardBlockComponent, type CardSize
- `src/widgets/cms-blocks/cms-footer-block/cms-footer-block.component.ts` — class CmsFooterBlockComponent
- `src/widgets/cms-blocks/hero-block/hero-block.component.ts` — class HeroBlockComponent
- `src/widgets/cms-blocks/image-card-block/image-card-block.component.ts` — class ImageCardBlockComponent
- `src/widgets/cms-blocks/image-grid-block/image-grid-block.component.ts` — class ImageGridBlockComponent
- `src/widgets/cms-blocks/image-list-block/image-list-block.component.ts` — class ImageListBlockComponent
- `src/widgets/cms-blocks/list-block/list-block.component.ts` — class ListBlockComponent
- `src/widgets/cms-blocks/section-card-grid-block/section-card-grid-block.component.ts` — class SectionCardGridBlockComponent
- `src/widgets/cms-blocks/section-contact-form-block/section-contact-form-block.component.ts` — class SectionContactFormBlockComponent
- `src/widgets/cms-blocks/section-faq-block/section-faq-block.component.ts` — class SectionFaqBlockComponent
- `src/widgets/cms-blocks/section-image-card-block/section-image-card-block.component.ts` — class SectionImageCardBlockComponent
- `src/widgets/cms-blocks/section-image-list/section-image-list.component.ts` — class SectionImageListComponent
- `src/widgets/cms-blocks/section-media-block/section-media-block.component.ts` — class SectionMediaBlockComponent
- `src/widgets/cms-blocks/section-onboarding-form-block/section-onboarding-form-block.component.ts` — class SectionOnboardingFormBlockComponent
- `src/widgets/cms-blocks/section-onboarding-form-block/section-onboarding-form-block.model.ts`
  - function parseSubheadingParts: (translated) => SubheadingParts
  - interface SubheadingParts
  - const AGATE_URLS: Record<string, string>
- `src/widgets/cms-blocks/section-text-image-block/section-text-image-block.component.ts` — class SectionTextImageBlockComponent
- `src/widgets/cms-blocks/section-timeline/section-timeline.component.ts` — class SectionTimelineComponent
- `src/widgets/cms-blocks/section-user-feedback-block/section-user-feedback-block.component.ts` — class SectionUserFeedbackBlockComponent
- `src/widgets/cms-blocks/text-image-block/text-image-block.component.ts` — class TextImageBlockComponent
- `src/widgets/cms-blocks/timeline-card/timeline-card.component.ts` — class TimelineCardComponent
- `src/widgets/cms-blocks/user-feedback-block/user-feedback-block.component.ts` — class UserFeedbackBlockComponent
- `src/widgets/consent-request-details/consent-request-details.component.ts` — class ConsentRequestDetailsComponent
- `src/widgets/consent-request-empty-state/consent-request-empty-state.component.ts` — class ConsentRequestEmptyStateComponent
- `src/widgets/consent-request-table/consent-request-filter/consent-request-filter.component.ts` — class ConsentRequestFilterComponent
- `src/widgets/consent-request-table/consent-request-list/consent-request-list.component.ts` — class ConsentRequestListComponent
- `src/widgets/consent-request-table/consent-request-producer-view-dto.directive.ts` — class ConsentRequestProducerViewDtoDirective
- `src/widgets/consent-request-table/consent-request-table.component.ts` — class ConsentRequestTableComponent
- `src/widgets/consent-requests-tour/consent-requests-tour-intro/consent-requests-tour-intro.component.ts` — class ConsentRequestsTourIntroComponent
- `src/widgets/consent-requests-tour/consent-requests-tour-trigger/consent-requests-tour-trigger.component.ts` — class ConsentRequestsTourTriggerComponent
- `src/widgets/contact-support-info/contact-support-info-content/contact-support-info-content.component.ts` — class ContactSupportInfoContentComponent
- `src/widgets/contact-support-info/contact-support-info.component.ts` — class ContactSupportInfoComponent
- `src/widgets/cookiebanner/cookiebanner.component.ts` — class CookiebannerComponent
- `src/widgets/data-product-detail-form/data-product-detail-form.component.ts` — class DataProductDetailFormComponent
- `src/widgets/data-product-detail-form/data-product-detail-form.model.ts`
  - function buildDataProductPayload: (form) => Record<string, unknown>
  - const DATA_PRODUCT_NEW_ID
  - const FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM
  - const FORM_TAB_IDS
  - const FLOW_CODE_OPTIONS: MultiSelectOption[]
  - const METHOD_CODE_OPTIONS: MultiSelectOption[]
  - _...1 more_
- `src/widgets/data-product-detail-form/data-product-detail-info/data-product-detail-info.component.ts` — class DataProductDetailInfoComponent
- `src/widgets/data-product-detail-form/data-product-detail-links-documents/data-product-detail-documents/data-product-detail-documents.component.ts` — class DataProductDetailDocumentsComponent
- `src/widgets/data-product-detail-form/data-product-detail-links-documents/data-product-detail-links-documents.component.ts` — class DataProductDetailLinksDocumentsComponent
- `src/widgets/data-product-detail-form/data-product-detail-links-documents/document-upload.store.ts` — class DocumentUploadStore
- `src/widgets/data-product-detail-form/data-product-detail-technical/data-product-detail-technical.component.ts` — class DataProductDetailTechnicalComponent
- `src/widgets/data-product-links/data-product-links.component.ts` — class DataProductLinksComponent
- `src/widgets/data-product-links/data-product-links.validators.ts`
  - function isEmptyLink: (link) => boolean
  - function filterFilledLinks: (links) => LinkDto[]
  - function absoluteUrlValidator
  - const MAX_LINKS
  - const URL_PATTERN
- `src/widgets/data-request-completion/data-request-completion-signature/data-request-completion-signature.component.ts` — class DataRequestCompletionSignatureComponent
- `src/widgets/data-request-completion/data-request-completion-signing-status/data-request-completion-signing-status.component.ts` — class DataRequestCompletionSigningStatusComponent
- `src/widgets/data-request-completion/data-request-completion.component.ts` — class DataRequestCompletionComponent
- `src/widgets/data-request-contact/data-request-contact.component.ts` — class DataRequestContactComponent
- `src/widgets/data-request-contract-pdf/data-request-contract-pdf.component.ts` — class DataRequestContractPdfComponent
- `src/widgets/data-request-contract-signature-policy/data-request-contract-signature-policy.component.ts` — class DataRequestContractSignaturePolicyComponent
- `src/widgets/data-request-contract-signing/contract-signature-input/contract-signature-input.component.ts` — class ContractSignatureInputComponent
- `src/widgets/data-request-contract-signing/data-request-contract-signing.component.ts` — class DataRequestContractSigningComponent
- `src/widgets/data-request-details/data-request-details-request/data-request-details-request.component.ts` — class DataRequestDetailsRequestComponent
- `src/widgets/data-request-details/data-request-details.component.ts` — class DataRequestDetailsComponent
- `src/widgets/data-request-details-contract/data-request-details-contract.component.ts` — class DataRequestDetailsContractComponent
- `src/widgets/data-request-details-wrapper/data-request-details-wrapper.component.ts` — class DataRequestDetailsWrapperComponent
- `src/widgets/data-request-form/data-request-form-consumer/data-request-form-consumer.component.ts` — class DataRequestFormConsumerComponent
- `src/widgets/data-request-form/data-request-form-contract/data-request-form-contract.component.ts` — class DataRequestFormContractComponent
- `src/widgets/data-request-form/data-request-form-producer/data-request-form-producer.component.ts` — class DataRequestFormProducerComponent
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-advantages/data-request-form-request-advantages.component.ts` — class DataRequestFormRequestAdvantagesComponent
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-advantages/data-request-form-request-advantages.model.ts` — function validateAdvantages, const MAX_ADVANTAGES
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-description/data-request-form-request-description.component.ts` — class DataRequestFormRequestDescriptionComponent
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-description/data-request-form-request-description.model.ts`
  - function parsePurposeSublabel: (translated) => PurposeSublabelParts
  - interface PurposeSublabelParts
  - const PURPOSE_PDF_FILENAMES: Record<string, string>
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-product/data-request-form-request-product.component.ts` — class DataRequestFormRequestProductComponent
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-product/data-request-form-request-product.model.ts`
  - function getDataSourceCode: (product) => string
  - function mapProductToOption: (product, lang) => ProductOption
  - function buildCategoriesMap: (products, lang) => Map<string, string>
  - interface ProductOption
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request.component.ts` — class DataRequestFormRequestComponent
- `src/widgets/data-request-preview/data-request-preview.component.ts` — class DataRequestPreviewComponent
- `src/widgets/data-request-privacy-infos/data-request-privacy-infos.component.ts` — class DataRequestPrivacyInfosComponent
- `src/widgets/data-request-provider-table/data-request-provider-table.component.ts` — class DataRequestProviderTableComponent
- `src/widgets/data-request-purpose-accordion/data-request-purpose-accordion.component.ts` — class DataRequestPurposeAccordionComponent
- `src/widgets/data-request-redirect-uri/data-request-redirect-uri.component.ts` — class DataRequestRedirectUriComponent
- `src/widgets/data-request-table/data-request-table.component.ts` — class DataRequestTableComponent
- `src/widgets/data-request-wizard/data-request-wizard-base/data-request-wizard-base.component.ts` — class DataRequestWizardBaseComponent
- `src/widgets/data-request-wizard/data-request-wizard-consumer/data-request-wizard-consumer.component.ts` — class DataRequestWizardConsumerComponent
- `src/widgets/data-request-wizard/data-request-wizard-provider/data-request-wizard-provider.component.ts` — class DataRequestWizardProviderComponent
- `src/widgets/data-request-wizard/data-request-wizard.component.ts` — class DataRequestWizardComponent
- `src/widgets/data-request-wizard/data-request-wizard.helper.ts` — function isStepCompleted: (formGroup, formsModel, formGroupName, checkExternalCompletion) => void
- `src/widgets/error-alert/error-alert.component.ts` — class ErrorAlertComponent
- `src/widgets/footer-widget/api/test-data.service.ts` — class TestDataApiService
- `src/widgets/footer-widget/ui/footer-widget.component.ts` — class FooterWidgetComponent
- `src/widgets/header-widget/header-widget.component.ts` — class HeaderWidgetComponent
- `src/widgets/navigation-widget/mobile-navigation-widget/mobile-navigation-widget.component.ts` — class MobileNavigationWidgetComponent
- `src/widgets/navigation-widget/navigation-widget.component.ts` — class NavigationWidgetComponent
- `src/widgets/new-year-banner/new-year-banner.component.ts` — class NewYearBannerComponent
- `src/widgets/notification-overlay/notification-overlay-content/notification-overlay-content.component.ts` — class NotificationOverlayContentComponent
- `src/widgets/notification-overlay/notification-overlay.component.ts` — class NotificationOverlayComponent
- `src/widgets/provider-data-request-details/provider-data-request-details.component.ts` — class ProviderDataRequestDetailsComponent
- `src/widgets/slider/slider.component.ts` — class SliderComponent
- `src/widgets/supporter-overlay/supporter-overlay.component.ts` — class SupporterOverlayComponent
- `src/widgets/uid-switch/uid-switch.component.ts` — class UidSwitchComponent

---

# Config

## Environment Variables

- `CI` **required** — jest.config.ts
- `EMAIL_SECRET` (has default) — .env.example
- `FONTAWESOME_PACKAGE_TOKEN` (has default) — .env
- `NODE_OPTIONS` (has default) — .env.example
- `POEDITOR_API_TOKEN` (has default) — .env.example
- `POEDITOR_PROJECT_ID` (has default) — .env.example

## Config Files

- `.env.example`
- `tsconfig.json`

---

# Middleware

## error-handler

- create-consent-request.guard.spec — `src/app/guards/create-consent-request.guard.spec.ts`
- create-consent-request.guard — `src/app/guards/create-consent-request.guard.ts`

## auth

- home-redirect.guard.spec — `src/app/guards/home-redirect.guard.spec.ts`
- home-redirect.guard — `src/app/guards/home-redirect.guard.ts`
- login.guard.spec — `src/app/guards/login.guard.spec.ts`
- login.guard — `src/app/guards/login.guard.ts`
- producer-uid.guard — `src/app/guards/producer-uid.guard.ts`
- impersonation-interceptor — `src/app/interceptors/impersonation-interceptor.ts`
- auth.config — `src/shared/lib/auth/auth.config.ts`
- auth.guard.spec — `src/shared/lib/auth/auth.guard.spec.ts`
- auth.guard — `src/shared/lib/auth/auth.guard.ts`
- auth.service.spec — `src/shared/lib/auth/auth.service.spec.ts`
- auth.service — `src/shared/lib/auth/auth.service.ts`

## custom

- producer-uid.guard.spec — `src/app/guards/producer-uid.guard.spec.ts`
- error-http-interceptor.spec — `src/app/interceptors/error-http-interceptor.spec.ts`
- error-http-interceptor — `src/app/interceptors/error-http-interceptor.ts`
- impersonation-interceptor.spec — `src/app/interceptors/impersonation-interceptor.spec.ts`
- title.strategy — `src/app/title.strategy.ts`

---

# Dependency Graph

## Most Imported Files (change these carefully)

- `src/shared/i18n/index.ts` — imported by **145** files
- `src/entities/openapi/index.ts` — imported by **123** files
- `src/entities/api/agridata-state.service.ts` — imported by **81** files
- `src/shared/constants/constants.ts` — imported by **76** files
- `src/app/error/error-handler.service.ts` — imported by **66** files
- `src/shared/ui/button/index.ts` — imported by **64** files
- `src/shared/lib/auth/index.ts` — imported by **62** files
- `src/entities/api/index.ts` — imported by **51** files
- `src/shared/testing/mocks/index.ts` — imported by **48** files
- `src/shared/testing/transloco-testing.module.ts` — imported by **41** files
- `src/entities/cms/index.ts` — imported by **41** files
- `src/shared/lib/form.helper.ts` — imported by **31** files
- `src/shared/toast/index.ts` — imported by **29** files
- `src/entities/api/master-data.service.ts` — imported by **23** files
- `src/shared/lib/api.helper.ts` — imported by **22** files
- `src/shared/ui/badge/index.ts` — imported by **21** files
- `src/environments/environment.ts` — imported by **19** files
- `src/entities/openapi/configuration.ts` — imported by **17** files
- `src/shared/ui/agridata-avatar/index.ts` — imported by **16** files
- `src/entities/openapi/encoder.ts` — imported by **15** files

## Import Map (who imports what)

- `src/shared/i18n/index.ts` ← `src/app/layout/default-layout.component.ts`, `src/app/title.service.spec.ts`, `src/app/title.service.ts`, `src/data-request-advantages/data-request-advantages.component.ts`, `src/entities/api/master-data.service.ts` +140 more
- `src/entities/openapi/index.ts` ← `src/app/app.config.ts`, `src/app/error/error-handler.service.spec.ts`, `src/app/error/error-handler.service.ts`, `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts` +118 more
- `src/entities/api/agridata-state.service.ts` ← `src/app/analytics-service.spec.ts`, `src/app/app.component.spec.ts`, `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts`, `src/app/guards/home-redirect.guard.spec.ts` +76 more
- `src/shared/constants/constants.ts` ← `src/app/app.routes.ts`, `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts`, `src/app/guards/home-redirect.guard.spec.ts`, `src/app/guards/home-redirect.guard.ts` +71 more
- `src/app/error/error-handler.service.ts` ← `src/app/error/error-handler.service.spec.ts`, `src/app/error/global-error-handler.spec.ts`, `src/app/error/global-error-handler.ts`, `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts` +61 more
- `src/shared/ui/button/index.ts` ← `src/pages/consent-request-producer/consent-request-producer.page.ts`, `src/pages/data-products-page/data-products-page.component.ts`, `src/pages/data-requests-consumer/data-requests-consumer.page.ts`, `src/pages/data-requests-provider/data-requests-provider.page.ts`, `src/pages/error-page/error-page.component.ts` +59 more
- `src/shared/lib/auth/index.ts` ← `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts`, `src/app/guards/home-redirect.guard.spec.ts` +57 more
- `src/entities/api/index.ts` ← `src/app/guards/create-consent-request.guard.spec.ts`, `src/app/guards/create-consent-request.guard.ts`, `src/pages/admin-page/admin.page.spec.ts`, `src/pages/admin-page/admin.page.ts`, `src/pages/consent-request-producer/consent-request-producer.page.spec.ts` +46 more
- `src/shared/testing/mocks/index.ts` ← `src/app/app.component.spec.ts`, `src/app/error/global-error-handler.spec.ts`, `src/app/guards/login.guard.spec.ts`, `src/app/title.service.spec.ts`, `src/pages/agb-page/agb-page.page.spec.ts` +43 more
- `src/shared/testing/transloco-testing.module.ts` ← `setup-jest.ts`, `src/app/analytics-service.spec.ts`, `src/app/layout/default-layout.component.spec.ts`, `src/data-request-advantages/data-request-advantages.component.spec.ts`, `src/pages/admin-page/admin.page.spec.ts` +36 more

---

# Events & Queues

- `update` [event] — `src/shared/ui/agridata-wysiwyg/agridata-wysiwyg.component.ts`
- `transaction` [event] — `src/shared/ui/agridata-wysiwyg/agridata-wysiwyg.component.ts`
- `blur` [event] — `src/shared/ui/agridata-wysiwyg/agridata-wysiwyg.component.ts`

---

# Test Coverage

> **25%** of routes and models are covered by tests
> 183 test files found

## Covered Routes

- GET:/

---

# CI/CD Pipelines

## GitHub Actions (14 workflows)

| Workflow               | Triggers                        | Jobs | Deploy | Environments |
| ---------------------- | ------------------------------- | ---- | ------ | ------------ |
| CI/CD Pipeline develop | pull_request, push, merge_group | 8    | —      | —            |
| CI/CD Pipeline main    | pull_request, push, merge_group | 9    | —      | —            |
| Storybook Deploy       | push                            | 2    | s3     | —            |
| Manual Deployment      | workflow_dispatch               | 3    | —      | —            |
| Renovate Bot           | workflow_dispatch, schedule     | 1    | —      | —            |

### CI/CD Pipeline develop

> `.github/workflows/ci_cd_pipeline_develop.yml`

- **check-single-commit** — 1 steps
  - `./.github/workflows/reusable__check_single_commit.yml`
- **check-comments** — 1 steps (needs: check-single-commit)
  - `./.github/workflows/reusable__check_comments.yml`
- **gitleaks** — 1 steps (needs: check-single-commit)
  - `./.github/workflows/reusable__gitleaks.yml`
- **unit-test-sonarqube** — 1 steps (needs: check-comments, gitleaks)
  - `./.github/workflows/reusable__unit_test_sonarqube.yml`
- **semantic-release** — 1 steps (needs: unit-test-sonarqube)
  - `./.github/workflows/reusable__semantic_release.yml`
- **read-version** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__read_version.yml`
- **build-push-s3** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path** — 1 steps (needs: read-version, build-push-s3)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`

### CI/CD Pipeline main

> `.github/workflows/ci_cd_pipeline_main.yml`

- **unit-test-sonarqube** — 1 steps
  - `./.github/workflows/reusable__unit_test_sonarqube.yml`
- **gitleaks** — 1 steps
  - `./.github/workflows/reusable__gitleaks.yml`
- **semantic-release** — 1 steps (needs: unit-test-sonarqube, gitleaks)
  - `./.github/workflows/reusable__semantic_release.yml`
- **read-version** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__read_version.yml`
- **build-push-s3-testing** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path-testing** — 1 steps (needs: read-version, build-push-s3-testing)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`
- **build-push-s3-integration** — 1 steps (needs: read-version)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path-integration** — 1 steps (needs: read-version, build-push-s3-integration)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`
- **merge-main-develop** — 1 steps (needs: semantic-release)
  - `./.github/workflows/reusable__merge_main_develop.yml`

### Storybook Deploy

> `.github/workflows/ci_cd_pipeline_storybook.yml`

- **build-push-s3** on `ubuntu-latest` — 7 steps → **s3**
  - `actions/checkout@v7`
  - `aws-actions/configure-aws-credentials@v6`
  - `actions/setup-node@v7`
- **invalidate-cloudfront** on `ubuntu-latest` — 2 steps (needs: build-push-s3)
  - `aws-actions/configure-aws-credentials@v6`

### Manual Deployment

> `.github/workflows/manual_deployment.yml`

- **resolve-inputs** on `ubuntu-latest` — 1 steps
- **build-push-s3** — 1 steps (needs: resolve-inputs)
  - `./.github/workflows/reusable__build_push_s3.yml`
- **set-cloudfront-origin-path** — 1 steps (needs: build-push-s3, resolve-inputs)
  - `./.github/workflows/reusable__set_cloudfront_origin_path.yml`

### Reusable Workflows

- `.github/workflows/reusable__build_push_s3.yml` — reusable\_\_build_push_s3 (build-push-s3)
- `.github/workflows/reusable__check_comments.yml` — reusable\_\_check_comments (check-comments)
- `.github/workflows/reusable__check_single_commit.yml` — reusable\_\_check_single_commit (check-single-commit)
- `.github/workflows/reusable__gitleaks.yml` — reusable\_\_gitleaks (git-leaks)
- `.github/workflows/reusable__merge_main_develop.yml` — reusable\_\_merge_main_develop (merge-main-develop)
- `.github/workflows/reusable__read_version.yml` — reusable\_\_read_version (read-version)
- `.github/workflows/reusable__semantic_release.yml` — reusable\_\_semantic_release (semantic-release)
- `.github/workflows/reusable__set_cloudfront_origin_path.yml` — reusable\_\_set_cloudfront_origin_path (set-cloudfront-origin-path)
- `.github/workflows/reusable__unit_test_sonarqube.yml` — reusable\_\_unit_test_sonarqube (unit-test-sonarqube)

### Secrets

- `FONTAWESOME_PACKAGE_TOKEN`
- `GITHUB_TOKEN`
- `LICENSE_KEY_GITLEAKS`
- `PRIVATE_KEY_GITHUB_APP_GITLEAKS`
- `PRIVATE_KEY_GITHUB_APP_RENOVATE_BOT`
- `PRIVATE_KEY_GITHUB_APP_SEMANTIC_RELEASE`
- `SONAR_TOKEN`

---

_Source: .github/workflows/ci_cd_pipeline_develop.yml, .github/workflows/ci_cd_pipeline_main.yml, .github/workflows/ci_cd_pipeline_storybook.yml, .github/workflows/manual_deployment.yml, .github/workflows/renovate_bot.yml, .github/workflows/reusable**build_push_s3.yml, .github/workflows/reusable**check_comments.yml, .github/workflows/reusable**check_single_commit.yml, .github/workflows/reusable**gitleaks.yml, .github/workflows/reusable**merge_main_develop.yml, .github/workflows/reusable**read_version.yml, .github/workflows/reusable**semantic_release.yml, .github/workflows/reusable**set_cloudfront_origin_path.yml, .github/workflows/reusable\_\_unit_test_sonarqube.yml_
_Generated by codesight-cicd-plugin_

---

# Git Hooks

> **Note for agents:** These hooks fire automatically on git operations and will block the operation if they fail.

## `pre-commit` — husky

- **npm**: `npm run prettier:staged && npx eslint src/ && src/scripts/check-comments.sh`

## `commit-msg` — husky

- **npx**: `npx --no -- commitlint --edit "$1"`

_Source: .husky/commit-msg, .husky/pre-commit_

---

# Claude Skills

Project-local slash commands available to Claude Code agents:

- `/a11y-review` — use the a11y-reviewer agent on all modified or new HTML template files in the current branch

_Source: .claude/commands_

---

_Generated by [codesight](https://github.com/Houseofmvps/codesight) — see your codebase clearly_
