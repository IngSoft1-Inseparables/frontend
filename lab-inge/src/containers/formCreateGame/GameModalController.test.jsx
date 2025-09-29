import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import * as HTTPService from "../../service/HTTPService";
import GameModalController from "./GameModalController";
import { vi } from "vitest";

vi.mock("../../service/HTTPService");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


it("envía los datos correctamente y cierra el modal al hacer submit", async () => {
  const mockCreateGame = vi.fn().mockResolvedValue({
    gameId: 123,
    myPlayerId: 456,
  });

  vi.mocked(HTTPService.createHttpService).mockImplementation(() => ({
    createGame: mockCreateGame,
  }));

  render(
    <BrowserRouter>
      <GameModalController />
    </BrowserRouter>
  );

  const openButton = screen.getByRole("button", { name: /Crear partida/i });
  await userEvent.click(openButton);

  const modal = screen.getByText(/Crear nueva partida/i).closest("div");
  const modalWithin = within(modal);

  await userEvent.type(modalWithin.getByLabelText(/Nombre de Usuario/i), "Micaela");
  await userEvent.type(modalWithin.getByLabelText(/Nombre de la Partida/i), "Partida 1");
  await userEvent.type(modalWithin.getByLabelText(/Fecha de nacimiento/i), "2000-05-10");
  await userEvent.selectOptions(modalWithin.getByTestId("minPlayers"), "2");
  await userEvent.selectOptions(modalWithin.getByTestId("maxPlayers"), "4");
  const avatars = modalWithin.getAllByRole("img");
  await userEvent.click(avatars[0]);

  const submitButton = modalWithin.getByRole("button", { name: /Crear Partida/i });
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

    // El modal debería cerrarse
    expect(screen.queryByText(/Crear nueva partida/i)).toBeNull();

    // Y navigate debería haberse llamado
    expect(mockNavigate).toHaveBeenCalledWith("/waiting", {
      state: { gameId: 123, myPlayerId: 456 },
      replace: true,
    });
  });
});

it("renderiza el botón para abrir el formulario", () => {

  render(
    <BrowserRouter>
      <GameModalController />
    </BrowserRouter>
  );
    const button = screen.getByRole("button", { name: /Crear partida/i });
    expect(button).toBeInTheDocument();
  });

  it("abre el formulario al hacer click en el botón", async () => {

  render(
    <BrowserRouter>
      <GameModalController />
    </BrowserRouter>
  );
    const button = screen.getByRole("button", { name: /Crear partida/i });
    await userEvent.click(button);
    expect(screen.getByText(/Crear nueva partida/i)).toBeInTheDocument();
  });