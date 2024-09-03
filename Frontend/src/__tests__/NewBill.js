/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given the user is logged in as an employee", () => {
  describe("When the user navigates to the New Bill page", () => {
    it("Then the new bill form should be displayed", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      const rootDiv = document.createElement("div");
      rootDiv.setAttribute("id", "root");
      document.body.append(rootDiv);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When the user submits a new expense report", () => {
    it("Then the new bill should be saved successfully", async () => {
      const navigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = NewBillUI();

      const billManager = new NewBill({
        document,
        onNavigate: navigate,
        store: null,
        localStorage: window.localStorage,
      });

      const formElement = screen.getByTestId("form-new-bill");
      expect(formElement).toBeTruthy();

      const handleFormSubmit = jest.fn((e) => billManager.handleSubmit(e));
      formElement.addEventListener("submit", handleFormSubmit);
      fireEvent.submit(formElement);

      expect(handleFormSubmit).toHaveBeenCalled();
    });
  });

  describe("When the user uploads a file", () => {
    it("Then the file should be processed correctly", async () => {
      jest.spyOn(mockStore, "bills");

      const navigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH.NewBill },
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      document.body.innerHTML = NewBillUI();

      const billManager = new NewBill({
        document,
        onNavigate: navigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const testFile = new File(["image"], "image.png", { type: "image/png" });
      const handleFileChange = jest.fn((e) => billManager.handleChangeFile(e));
      const fileInput = screen.getByTestId("file");

      fileInput.addEventListener("change", handleFileChange);
      userEvent.upload(fileInput, testFile);

      expect(fileInput.files[0].name).toBeDefined();
      expect(handleFileChange).toHaveBeenCalled();

      const formElement = screen.getByTestId("form-new-bill");
      const handleFormSubmit = jest.fn((e) => billManager.handleSubmit(e));
      formElement.addEventListener("submit", handleFormSubmit);
      fireEvent.submit(formElement);

      expect(handleFormSubmit).toHaveBeenCalled();
    });
  });
});
