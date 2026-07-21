# Libraries

> **Navigation aid.** Library inventory extracted via AST. Read the source files listed here before modifying exported functions.

**218 library files** across 5 modules

## Widgets (95 files)

- `src/widgets/data-product-detail-form/data-product-detail-form.model.ts` — buildDataProductPayload, DATA_PRODUCT_NEW_ID, FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM, FORM_TAB_IDS, FLOW_CODE_OPTIONS, METHOD_CODE_OPTIONS, …
- `src/widgets/data-product-links/data-product-links.validators.ts` — isEmptyLink, filterFilledLinks, absoluteUrlValidator, MAX_LINKS, URL_PATTERN
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-product/data-request-form-request-product.model.ts` — getDataSourceCode, mapProductToOption, buildCategoriesMap, ProductOption
- `src/widgets/cms-blocks/section-onboarding-form-block/section-onboarding-form-block.model.ts` — parseSubheadingParts, SubheadingParts, AGATE_URLS
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-description/data-request-form-request-description.model.ts` — parsePurposeSublabel, PurposeSublabelParts, PURPOSE_PDF_FILENAMES
- `src/widgets/cms-blocks/card-block/card-block.component.ts` — CardBlockComponent, CardSize
- `src/widgets/data-request-form/data-request-form-request/data-request-form-request-advantages/data-request-form-request-advantages.model.ts` — validateAdvantages, MAX_ADVANTAGES
- `src/widgets/account-overlay/account-overlay.component.ts` — AccountOverlayComponent
- `src/widgets/admin-data-request-details/admin-data-request-details.component.ts` — AdminDataRequestDetailsComponent
- `src/widgets/admin-data-request-table/admin-data-request-table.component.ts` — AdminDataRequestTableComponent
- `src/widgets/agridata-accordion/agridata-accordion.component.ts` — AgridataAccordionComponent
- `src/widgets/agridata-contact-card/agridata-contact-card.component.ts` — AgridataContactCardComponent
- `src/widgets/agridata-wizard/agridata-wizard-stepper/agridata-wizard-stepper.component.ts` — AgridataWizardStepperComponent
- `src/widgets/agridata-wizard/agridata-wizard.component.ts` — AgridataWizardComponent
- `src/widgets/alert/alert.component.ts` — AlertComponent
- `src/widgets/cms-blocks/cms-footer-block/cms-footer-block.component.ts` — CmsFooterBlockComponent
- `src/widgets/cms-blocks/hero-block/hero-block.component.ts` — HeroBlockComponent
- `src/widgets/cms-blocks/image-card-block/image-card-block.component.ts` — ImageCardBlockComponent
- `src/widgets/cms-blocks/image-grid-block/image-grid-block.component.ts` — ImageGridBlockComponent
- `src/widgets/cms-blocks/image-list-block/image-list-block.component.ts` — ImageListBlockComponent
- `src/widgets/cms-blocks/list-block/list-block.component.ts` — ListBlockComponent
- `src/widgets/cms-blocks/section-card-grid-block/section-card-grid-block.component.ts` — SectionCardGridBlockComponent
- `src/widgets/cms-blocks/section-contact-form-block/section-contact-form-block.component.ts` — SectionContactFormBlockComponent
- `src/widgets/cms-blocks/section-faq-block/section-faq-block.component.ts` — SectionFaqBlockComponent
- `src/widgets/cms-blocks/section-image-card-block/section-image-card-block.component.ts` — SectionImageCardBlockComponent
- _…and 70 more files_

## Shared (87 files)

- `src/shared/lib/form.helper.ts` — buildItemGroup, buildReactiveForm, getErrorMessage, getFormControl, getFormArray, getFormControlWithMessages, …
- `src/shared/consent-request/consent-request.utils.ts` — getToastTitle, getToastMessage, getToastType, getUndoAction, buildConsentRequestTourSteps
- `src/shared/testing/mocks/mock-agridata-state-service.ts` — createMockAgridataStateService, MockAgridataStateServiceTestSignals, MockAgridataStateService, BE_VERSION, mockUids
- `src/shared/lib/api.helper.ts` — arrayToObjectSortParams, createResourceErrorHandlerEffect, createResourceValueComputed, PageResponseDto
- `src/shared/notification/notification.util.ts` — getNotificationRoute, getRouteForTarget, toggleReadStatus, markAllAsRead
- `src/shared/testing/mocks/mock-auth-service.ts` — createMockAuthService, MockAuthServiceTestSignals, MockAuthService, mockUserInfo
- `src/shared/testing/mocks/mock-cms-service.ts` — createMockCmsService, MockCmsService, mockCmsResponse, mockCmsService
- `src/shared/testing/mocks/mock-contract-revision-service.ts` — createMockContractRevisionService, MockContractRevisionService, mockOtpChallenge, mockContractRevision
- `src/shared/testing/mocks/mock-notification-service.ts` — createMockNotificationService, MockNotificationService, mockInboxEntries, mockHeaderNotifications
- `src/shared/utils/ui.util.ts` — calculateVerticalPlacement, copyToClipboard, startCountdown, VerticalPlacement
- `src/shared/forms/cross-field.validators.ts` — hasText, crossFieldValidation, revalidateCrossFieldGroup
- `src/shared/lib/cms/cms.utils.ts` — generateMediaUrl, isVideo, contractAgbUrl
- `src/shared/testing/mocks/mock-consent-request-service.ts` — createMockConsentRequestService, MockConsentRequestService, mockConsentRequests
- `src/shared/testing/mocks/mock-data-request-service.ts` — createMockDataRequestService, MockDataRequestService, mockDataRequests
- `src/shared/testing/mocks/mock-document.ts` — createMockDocument, MockLocation, MockDocumentResult
- `src/shared/testing/mocks/mock-master-data-service.ts` — createMockMasterDataService, MockMasterDataServiceTestSignals, MockMasterDataService
- `src/shared/testing/mocks/mock-title-service.ts` — createMockTitleService, MockTitleServiceSignals, MockTitleService
- `src/shared/testing/mocks/mock-user-service.ts` — createMockUserService, MockUserService, mockUserService
- `src/shared/ui/badge/agridata-badge.component.ts` — AgridataBadgeComponent, BadgeVariant, BadgeSize
- `src/shared/data-request/data-request.utils.ts` — getBadgeVariant, getFieldFromLang
- `src/shared/i18n/i18n.pipe.ts` — I18nPipe, OrArray
- `src/shared/testing/mocks/mock-activated-route.ts` — createMockActivatedRoute, MockActivatedRoute
- `src/shared/testing/mocks/mock-analytics-service.ts` — createMockAnalyticsService, MockAnalyticsService
- `src/shared/testing/mocks/mock-data-product-document-service.ts` — createMockDataProductDocumentService, MockDataProductDocumentService
- `src/shared/testing/mocks/mock-data-product-service.ts` — createMockDataProductService, MockDataProductService
- _…and 62 more files_

## Entities (31 files)

- `src/entities/api/agridata-state.service.ts` — AgridataStateService, DISMISSED_MIGRATIONS_KEY
- `src/entities/openapi/configuration.ts` — Configuration, ConfigurationParameters
- `src/entities/api/backend-info.service.ts` — BackendInfoService
- `src/entities/api/consent-request.service.ts` — ConsentRequestService
- `src/entities/api/contract-revision.service.ts` — ContractRevisionService
- `src/entities/api/data-product-document.service.ts` — DataProductDocumentService
- `src/entities/api/data-product.service.ts` — DataProductService
- `src/entities/api/data-providers.service.ts` — DataProvidersService
- `src/entities/api/data-request.service.ts` — DataRequestService
- `src/entities/api/master-data.service.ts` — MasterDataService
- `src/entities/api/notification.service.ts` — NotificationService
- `src/entities/api/uid-register.service.ts` — UidRegisterService
- `src/entities/api/user.service.ts` — UserService
- `src/entities/cms/cms.service.ts` — CmsService
- `src/entities/openapi/api/bITSignatureTest.service.ts` — BITSignatureTestService
- `src/entities/openapi/api/consentRequestAggregations.service.ts` — ConsentRequestAggregationsService
- `src/entities/openapi/api/consentRequests.service.ts` — ConsentRequestsService
- `src/entities/openapi/api/contractRevisions.service.ts` — ContractRevisionsService
- `src/entities/openapi/api/dataProducts.service.ts` — DataProductsService
- `src/entities/openapi/api/dataProviders.service.ts` — DataProvidersService
- `src/entities/openapi/api/dataRequests.service.ts` — DataRequestsService
- `src/entities/openapi/api/dataTransfer.service.ts` — DataTransferService
- `src/entities/openapi/api/dataTransferV2.service.ts` — DataTransferV2Service
- `src/entities/openapi/api/infoResource.service.ts` — InfoResourceService
- `src/entities/openapi/api/notifications.service.ts` — NotificationsService
- _…and 6 more files_

## Features (4 files)

- `src/features/debug/debug.service.ts` — DebugService, RequestInfo, ResponseInfo
- `src/features/cms-blocks/cms-block-renderer.component.ts` — BlockRendererComponent
- `src/features/debug/debug-modal.component.ts` — DebugModalComponent
- `src/features/language-select/language-select.component.ts` — LanguageSelectComponent

## Data-request-advantages (1 files)

- `src/data-request-advantages/data-request-advantages.component.ts` — DataRequestAdvantagesComponent

---

_Back to [overview.md](./overview.md)_
