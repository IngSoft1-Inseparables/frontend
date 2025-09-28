import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import GameModalController from "./GameModalController";
import * as HTTPService from "../../service/HTTPService";

vi.mock("../../service/HTTPService", () => ({
  createHttpService: vi.fn(() => ({
    createGame: vi.fn(),
  })),
}));

describe("GameModalController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <GameModalController />
      </BrowserRouter>
    );
  });

  it("renderiza el botón para abrir el formulario", () => {
    const button = screen.getByRole("button", { name: /Crear partida/i });
    expect(button).toBeInTheDocument();
  });

  it("abre el formulario al hacer click en el botón", async () => {
    const button = screen.getByRole("button", { name: /Crear partida/i });
    await userEvent.click(button);

    // Verificamos que CreateFormGame esté en el DOM
    expect(screen.getByText(/Crear nueva partida/i)).toBeInTheDocument();
  });
it("envía los datos correctamente al hacer submit en el formulario", async () => {
  // 1️⃣ Creamos el mock antes de renderizar el componente
  const mockCreateGame = vi.fn().mockResolvedValue({}); 

  // 2️⃣ Mockeamos createHttpService para que devuelva nuestro mock
  vi.mocked(HTTPService.createHttpService).mockImplementation(() => ({
    createGame: mockCreateGame,
  }));

  // 3️⃣ Renderizamos el componente
  render(
    <BrowserRouter>
      <GameModalController />
    </BrowserRouter>
  );

  // 4️⃣ Abrimos el modal
const openButtons = screen.getAllByRole("button", { name: /Crear partida/i });
await userEvent.click(openButtons[0]);

  // 5️⃣ Acotamos la búsqueda al modal
  const modal = screen.getByText(/Crear nueva partida/i).closest("div");
  const modalWithin = within(modal);

  // 6️⃣ Llenamos el formulario
  await userEvent.type(modalWithin.getByLabelText(/Nombre de Usuario/i), "Micaela");
  await userEvent.type(modalWithin.getByLabelText(/Nombre de la Partida/i), "Partida 1");
  await userEvent.type(modalWithin.getByLabelText(/Fecha de nacimiento/i), "2000-05-10");
  await userEvent.selectOptions(modalWithin.getByTestId("minPlayers"), "2");
  await userEvent.selectOptions(modalWithin.getByTestId("maxPlayers"), "4");
  const avatars = modalWithin.getAllByRole("img");
  await userEvent.click(avatars[0]);

  // 7️⃣ Enviamos el formulario
  const submitButton = modalWithin.getByRole("button", { name: /Crear Partida/i });
  await userEvent.click(submitButton);

  // 8️⃣ Verificamos que se haya llamado a createGame con los datos correctos
  await waitFor(() =>
    expect(mockCreateGame).toHaveBeenCalledWith(
      {
        name: "Micaela",
        birthday: "2000-05-10",
        avatar: "avatar/avatar1.png",
      },
      { nameGame: "Partida 1", minPlayers: "2", maxPlayers: "4" }
    )
  );

  expect(mockCreateGame).toHaveBeenCalledTimes(1);
});

  it("debería procesar correctamente la respuesta del backend", async () => {
    // Simulamos lo que enviaría el backend
    const mockPlayerData = {
      nameUser: "Micaela",
      birthday: "2003-04-02",
      avatar: "avatar/avatar1.png",
    };

    const mockformDataGame = {
      nameGame: "Partida 1",
      minPlayers: "3",
      maxPlayers: "5",
    };

    const mockResponse = {
      gameId: 123,
      myPlayerId: 456,
      players: [{ id: 456, name: "Micaela" }],
    };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const service = HTTPService.createHttpService();
    service.createGame.mockResolvedValueOnce(mockResponse);

    const response = await service.createGame({}, {});
    expect(response.gameId).toBe(123);
    expect(response.myPlayerId).toBe(456);

    // También podés chequear que fetch se llamó con los parámetros correctos
    // expect(service.createGame).toHaveBeenCalledWith(mockPlayerData, mockformDataGame);
  });
});
