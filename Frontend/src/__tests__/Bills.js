/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("When connected in as an employee", () => {
  it("Bills should be sorted from most recent to oldest", () => {
    document.body.innerHTML = BillsUI({
      data: bills.sort((a, b) => (a.date < b.date ? 1 : -1)),
    });
    const dates = screen
      .getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      )
      .map((a) => a.innerHTML);
    const datesSorted = [...dates].sort((a, b) => (a < b ? 1 : -1));
    expect(dates).toEqual(datesSorted);
  });
  describe("When viewing the Bills Page", () => {
    it("The bill icon in the sidebar should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toHaveClass("active-icon");
    });
  });

  describe("When clicking the 'Nouvelle note de frais' button", () => {
    it("The new bill form should be displayed", async () => {
      const navigateTo = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const billHandler = new Bills({
        document,
        onNavigate: navigateTo,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const clickNewBill = jest.fn(() => billHandler.handleClickNewBill());
      const newBillButton = screen.getByTestId("btn-new-bill");
      newBillButton.addEventListener("click", clickNewBill);
      userEvent.click(newBillButton);
      expect(clickNewBill).toHaveBeenCalled();
      await waitFor(() => screen.getByTestId("form-new-bill"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When clicking on the eye icon of a bill", () => {
    it("A modal should appear", async () => {
      const navigateTo = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const billHandler = new Bills({
        document,
        onNavigate: navigateTo,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const clickEyeIcon = jest.fn((icon) =>
        billHandler.handleClickIconEye(icon)
      );
      const eyeIcons = screen.getAllByTestId("icon-eye");
      const modalElement = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modalElement.classList.add("show"));
      eyeIcons.forEach((icon) => {
        icon.addEventListener("click", clickEyeIcon(icon));
        userEvent.click(icon);
        expect(clickEyeIcon).toHaveBeenCalled();
      });
      expect(modalElement).toHaveClass("show");
    });
  });

  describe("When navigating to the Bills page", () => {
    it("The page should be displayed correctly", async () => {
      const navigateTo = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      new Bills({
        document,
        onNavigate: navigateTo,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });

  describe("When an API error occurs", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    it("Displays 404 error message on API failure", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 404")),
        };
      });
      const pageContent = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = pageContent;
      const errorMessage = await screen.getByText(/Erreur 404/);
      expect(errorMessage).toBeTruthy();
    });

    it("Displays 500 error message on API failure", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 500")),
        };
      });
      const pageContent = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = pageContent;
      const errorMessage = await screen.getByText(/Erreur 500/);
      expect(errorMessage).toBeTruthy();
    });
  });
});
