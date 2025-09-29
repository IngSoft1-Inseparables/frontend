import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./HomePage";
import { BrowserRouter } from "react-router-dom";

describe("Home Component", () => {
  it("renders the home container", () => {
    render(   <BrowserRouter>
        <Home />
      </BrowserRouter>);
    const container = screen.getByTestId("Home-container");
    expect(container).toBeInTheDocument();
  });

  it("renders the characters image", () => {
    render(   <BrowserRouter>
        <Home />
      </BrowserRouter>);
    const charactersImg = screen.getByTestId("characters-img");
    expect(charactersImg).toBeInTheDocument();
    expect(charactersImg).toHaveAttribute("src", expect.stringContaining("characters.png"));
    expect(charactersImg).toHaveAttribute("alt", "characters");
  });

  it("renders the title image", () => {
    render(   <BrowserRouter>
        <Home />
      </BrowserRouter>);
    const titleImg = screen.getByTestId("title-img");
    expect(titleImg).toBeInTheDocument();
    expect(titleImg).toHaveAttribute("src", expect.stringContaining("nameGame.png"));
    expect(titleImg).toHaveAttribute("alt", "Name Game");
  });
});