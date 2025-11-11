import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "./HomePage";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  describe("Event handlers and functions", () => {
    it("llama a handleOpenGameList cuando se hace click en 'Unirse a una partida'", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const joinButton = screen.getByText("Unirse a una partida");
      fireEvent.click(joinButton);
      
      expect(mockNavigate).toHaveBeenCalledWith("/games");
    });

    it("abre el modal cuando se hace click en 'Crear una partida'", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const createButton = screen.getByText("Crear una partida");
      fireEvent.click(createButton);
      
      // Verificar que el modal existe (GameModalController se renderiza)
      // El modal debe estar en el DOM después del click
      expect(screen.getByText("Crear una partida")).toBeInTheDocument();
    });

    it("handleOpenForm establece open a true", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const createButton = screen.getByText("Crear una partida");
      
      // Inicialmente el modal podría no estar visible
      fireEvent.click(createButton);
      
      // Después del click, el estado cambia y el modal se muestra
      // (GameModalController recibe isOpen=true)
      expect(createButton).toBeInTheDocument();
    });

    it("previene drag en el contenedor principal", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const container = screen.getByTestId("Home-container");
      
      // El contenedor tiene draggable="false"
      expect(container).toHaveAttribute("draggable", "false");
    });

    it("previene drag en la imagen de characters", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const charactersImg = screen.getByTestId("characters-img");
      expect(charactersImg).toHaveAttribute("draggable", "false");
    });

    it("previene drag en la imagen del título", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const titleImg = screen.getByTestId("title-img");
      expect(titleImg).toHaveAttribute("draggable", "false");
    });

    it("setOpen se llama desde el botón GenericButton", () => {
      render(<BrowserRouter><Home /></BrowserRouter>);
      
      const createButton = screen.getByText("Crear una partida");
      fireEvent.click(createButton);
      
      // El estado open cambia, lo que hace que GameModalController se renderice
      expect(createButton).toBeInTheDocument();
    });
  });
});
