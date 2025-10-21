Context

this is a zoneless angular 20 application using signals and the new experimental resources for api data retrieval

General rules:

- dont use rxjs, use signals or promises where possible
- Make sure to use recommended techniques of angular 20 like effects and computed signals.
- be sure to make everything type safe, dont cast to other types if possible
- dont use the any type
- strive for simplicity and clean code
- use tailwind for styling.
- Focus on minimalistic styles
- make sure that import are ordered alphabetically
- Arrange properties in this order: Injects, Constants, Input properties, Model properties, Output properties, Signals, Computed Signals, Effects. If there are many properties create a comment per category. In each catogroy put publilc before protected before private properties.
- only input / output properties should be public, properties used by html should be protected others private
- Make properties readonly where possible
- sort functions alphabetically and by visability (public, protected, private)
- make sure not to sort an array directly but rather its copy: [...myArray].sort(...)
- add the comment on classes except on test classes. Example:

  ```angular2html
  /**
  * Displays a banner of an error, emits closeError once close button is clicked
  *
  * CommentLastReviewed: 2025-10-13
  */
  ```

  It is important to include the CommentLastReviewed and that it is the current date.

For tests adhere to those rules:

- Focus tests on features with high complexity. I don't want too many tests.
- Don't test the implementation but rather verify the components function. You don't need to mock child components.
- don't test style related features
- jest for mocking and spies.
- add a constant usable by any tests like this: component = fixture.componentInstance; Use this where possible instead of componentRef
- add a constant usable by any tests like this: let componentRef: ComponentRef<ErrorModal> = fixture.componentRef;
- insert signals like that: componentRef.setInput('fieldname', fieldValue);
- access protected properties and functions with component["property"].
- omit trying to access private properties or functions
- if you need to find elements in the dom it is best to use their aria label or the translation key used inside the html element.
- To simulate click on agridata button component use the following:
  const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
  const matchingButton = buttons.find((btn) =>
  btn.query(By.css('[aria-label="common.ariaLabel.close"]')),
  );
  matchingButton?.triggerEventHandler('onClick', null);
- use the following for mocking services:
  export const mockMetadataService: Partial<MetaDataService> = {
  getDataProducts: jest.fn().mockReturnValue(signal([])),
  };
- for each mock service create a variable in the main describe block like this:
  let mockMetaDataService: Partial<MetaDataService>;
- in the beforeEach block assign the mock to the variable like this: metadataService = mockMetadataService; Sometimes you may need to override a signal or a function for a specific test, this ensures that the test is reset to the original mock before each test.
- when testing a resource created in the tested component override the service function that is used in its loader function like that:

  ```
   it('should handle errors from dataRequestsResource and send them to errorService', async () => {
   const testError = new Error('Test error from fetchDataRequests');
   (dataRequestService.fetchDataRequests as jest.Mock).mockRejectedValueOnce(testError);

   // Create a new fixture with the mocked error
   const errorFixture = TestBed.createComponent(DataRequestsConsumerPage);
   errorFixture.detectChanges();
   await errorFixture.whenStable();

   expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });
  ```

- import this into the testbed to mock transloco:
  ```
       getTranslocoModule({
         langs: {
             de: {},
         },
       }),
  ```
