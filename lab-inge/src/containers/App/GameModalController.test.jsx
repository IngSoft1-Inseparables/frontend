import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within,waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GameModalController from "./GameModalController";
import * as HTTPService from "../../service/HTTPService";

vi.mock("../../service/HTTPService", () => ({
  createHttpService: {
    creatGame: vi.fn(),
  },
}));

describe("GameModalController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<GameModalController />);
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
    const mockCreateGame = HTTPService.createHttpService.creatGame;
    mockCreateGame.mockResolvedValueOnce({}); // simulamos éxito

    // Abrimos el modal
    const openButton = screen.getByRole("button", { name: /Crear partida/i });
    await userEvent.click(openButton);

    // Acotamos la búsqueda al modal
    const modal = screen.getByText(/Crear nueva partida/i).closest("div");
    const modalWithin = within(modal);

    // Llenamos el formulario
    await userEvent.type(
      modalWithin.getByLabelText(/Nombre de Usuario/i),
      "Micaela"
    );
    await userEvent.type(
      modalWithin.getByLabelText(/Nombre de la Partida/i),
      "Partida 1"
    );
    await userEvent.type(
      modalWithin.getByLabelText(/Fecha de nacimiento/i),
      "2000-05-10"
    );
    await userEvent.selectOptions(modalWithin.getByTestId("minPlayers"), "2");
    await userEvent.selectOptions(modalWithin.getByTestId("maxPlayers"), "4");
    const avatars = modalWithin.getAllByRole("img");
    await userEvent.click(avatars[0]);

    // Enviamos el formulario
    const submitButton = modalWithin.getByRole("button", {
      name: /Crear Partida/i,
    });
    await userEvent.click(submitButton);

    // Verificamos que se haya llamado a la función con los datos correctos
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
});
