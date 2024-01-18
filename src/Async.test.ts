import fc from "fast-check";
import { toCancelablePromise } from "./Async";

describe("Async utilities", () => {
  describe("toCancelablePromise", () => {
    it("Allows the input promise to resolve normally", () => {
      return fc.assert(
        fc.asyncProperty(fc.anything(), (value) => {
          const actual = toCancelablePromise(Promise.resolve(value));

          expect(actual.getStatus()).toEqual("pending");

          return expect(actual.promise)
            .resolves.toBe(value)
            .then(() => {
              expect(actual.getStatus()).toEqual("resolved");
            });
        }),
      );
    });

    it("Allows the input promise to reject normally", () => {
      return fc.assert(
        fc.asyncProperty(fc.anything(), (rejectedValue) => {
          const actual = toCancelablePromise(Promise.reject(rejectedValue));

          return expect(actual.promise)
            .rejects.toBe(rejectedValue)
            .then(() => {
              expect(actual.getStatus()).toEqual("rejected");
            });
        }),
      );
    });

    it("Cancels by rejecting if `cancel` is called before resolution", () => {
      ////// Arrange
      const actual = toCancelablePromise(
        // This promise never resolves...
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        new Promise((_resolve) => {}),
      );

      ////// Act
      actual.cancel();

      ////// Assert
      return expect(actual.promise)
        .rejects.toThrowError(/Promise canceled by caller./)
        .then(() => {
          expect(actual.getStatus()).toEqual("canceled");
        });
    });

    it("Does not throw when catching a cancellation", () => {
      ////// Arrange
      const actual = toCancelablePromise(
        // This promise never resolves...
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        new Promise((_resolve) => {}),
      );

      ////// Act
      actual.cancel();

      ////// Assert
      return actual.promise.catch((e) => {
        expect(e.message).toMatch(/Promise canceled by caller./);
      });
    });

    test("`cancel` does not throw when called after resolution", () => {
      return fc.assert(
        fc.asyncProperty(fc.anything(), (value) => {
          const { promise: actual, cancel } = toCancelablePromise(
            Promise.resolve(value),
          );

          return actual.then(() => {
            cancel();
          });
        }),
      );
    });

    test("`cancel` does not throw when called after rejection", () => {
      return fc.assert(
        fc.asyncProperty(fc.anything(), (rejectedValue) => {
          const { promise: actual, cancel } = toCancelablePromise(
            Promise.reject(rejectedValue),
          );

          return expect(actual)
            .rejects.toBe(rejectedValue)
            .then(() => {
              cancel();
            });
        }),
      );
    });
  });
});
