import { vi } from "vitest";

vi.mock("../../services/WSService", () => {
  const listeners = {};
  const mockWS = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn((event, cb) => {
      (listeners[event] ||= []).push(cb);
    }),
    off: vi.fn((event, cb) => {
      listeners[event] = (listeners[event] || []).filter((fn) => fn !== cb);
    }),

    // helpers para tests
    __emit: (event, payload) => {
      (listeners[event] || []).forEach((fn) => fn(payload));
    },
    __reset: () => {
      for (const k of Object.keys(listeners)) delete listeners[k];
    },
  };

  return {
    createWSService: () => mockWS, // lo que usa WaitingRoom al importar el servicio
    __mockWS: mockWS,              // lo exportamos para usarlo desde el test
  };
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WaitingRoom from "./WaitingRoom";
import { __mockWS as mockWS } from "../../services/WSService";

describe("WaitingRoom component", () => {
  beforeEach(() => {
    mockWS.__reset();
    vi.clearAllMocks();
  });

  it("renderiza el título del juego", () => {
    render(<WaitingRoom />);
    const title = screen.getByRole("heading", { name: /El juego comenzará pronto/i });
    expect(title).toBeInTheDocument();
  });

  it("muestra el contador de jugadores (actualizado por WS)", async () => {
    render(<WaitingRoom />);
    // Simulamos mensaje del back
    mockWS.__emit("count", { count: 2 });
    expect(await screen.findByText("2/6")).toBeInTheDocument();
  });

  it("renderiza el botón de iniciar partida", () => {
    render(<WaitingRoom />);
    const button = screen.getByRole("button", { name: /Iniciar Partida/i });
    expect(button).toBeInTheDocument();
  });

  it("permite clickear el botón de iniciar partida", async () => {
    const user = userEvent.setup();
    render(<WaitingRoom />);
    const button = screen.getByRole("button", { name: /Iniciar Partida/i });
    await user.click(button);
    expect(button).toBeEnabled();
  });
});
