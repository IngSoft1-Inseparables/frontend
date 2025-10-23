import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import * as HTTPService from "../../services/HTTPService";
import GameModalController from "./GameModalController";
import { vi } from "vitest";

vi.mock("../../services/HTTPService");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("GameModalController", () => {
  it("envía los datos correctamente y cierra el modal al hacer submit", async () => {
    const mockCreateGame = vi.fn().mockResolvedValue({
      id: 123,
      creator_id: 456,
    });

    vi.mocked(HTTPService.createHttpService).mockImplementation(() => ({
      createGame: mockCreateGame,
    }));

    const mockOnClose = vi.fn();

    render(
      <BrowserRouter>
        <GameModalController isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    // El modal debería estar visible
    const modal = screen.getByText(/Crear nueva partida/i).closest("div");
    const modalWithin = within(modal);

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

    const submitButton = modalWithin.getByRole("button", {
      name: /Crear Partida/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateGame).toHaveBeenCalledWith({
        game_name: "Partida 1",
        min_players: 2,
        max_players: 4,
        creator_name: "Micaela",
        birth_date: "2000-05-10",
        avatar: "avatar/avatar1.png",
      });

      // Se debió llamar al onClose
      expect(mockOnClose).toHaveBeenCalled();

      // El navigate debería haberse disparado
      expect(mockNavigate).toHaveBeenCalledWith("/waiting", {
        state: { gameId: 123, myPlayerId: 456 },
        replace: true,
      });
    });
  });

  it("muestra alert cuando createGame falla", async () => {
    const mockCreateGame = vi.fn().mockRejectedValue(new Error("400 badRequest"));

    vi.mocked(HTTPService.createHttpService).mockImplementation(() => ({
      createGame: mockCreateGame,
    }));

    const mockOnClose = vi.fn();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <GameModalController isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    // El modal debería estar visible
    const modal = screen.getByText(/Crear nueva partida/i).closest("div");
    const modalWithin = within(modal);

    await userEvent.type(
      modalWithin.getByLabelText(/Nombre de Usuario/i),
      "Micaela"
    );
    await userEvent.type(
      modalWithin.getByLabelText(/Nombre de la Partida/i),
      "Partida Duplicada"
    );
    await userEvent.type(
      modalWithin.getByLabelText(/Fecha de nacimiento/i),
      "2000-05-10"
    );
    await userEvent.selectOptions(modalWithin.getByTestId("minPlayers"), "2");
    await userEvent.selectOptions(modalWithin.getByTestId("maxPlayers"), "4");

    const avatars = modalWithin.getAllByRole("img");
    await userEvent.click(avatars[0]);

    const submitButton = modalWithin.getByRole("button", {
      name: /Crear Partida/i,
    });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateGame).toHaveBeenCalled();
        expect(alertMock).toHaveBeenCalledWith(
          "El nombre 'Partida Duplicada' ya está en uso. Ingresa un nombre distinto."
        );
    });

    alertMock.mockRestore();
  });
});
