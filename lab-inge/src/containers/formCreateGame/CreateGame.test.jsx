import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateFormGame from "./CreateFormGame";
describe("CreateFormGame - Renderizado de campos", () => {
  const mockSubmit = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    render(<CreateFormGame onSubmit={mockSubmit} onClose={mockClose} />);
  });

  it("muestra el input de Nombre de Usuario", () => {
    expect(screen.getByLabelText(/Nombre de Usuario/i)).toBeInTheDocument();
  });

  it("muestra el input de Fecha de nacimiento", () => {
    expect(screen.getByLabelText(/Fecha de nacimiento/i)).toBeInTheDocument();
  });

  it("muestra los avatares", () => {
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBe(6);
  });

  it("muestra el input de Nombre de la Partida", () => {
    expect(screen.getByLabelText(/Nombre de la Partida/i)).toBeInTheDocument();
  });

  it("muestra los selects de Minimo y Maximo de jugadores", () => {
    expect(screen.getByTestId("minPlayers")).toBeInTheDocument();
    expect(screen.getByTestId("maxPlayers")).toBeInTheDocument();
  });

  it("muestra el botón de Crear Partida", () => {
    expect(
      screen.getByRole("button", { name: /Crear Partida/i })
    ).toBeInTheDocument();
  });
});

describe("CreateFormGame - funcionalidades de los elementos", () => {
  const mockSubmit = vi.fn();
  const mockClose = vi.fn();
  beforeEach(() => {
    render(<CreateFormGame onSubmit={mockSubmit} onClose={mockClose} />);
  });
  it("permite escribir en el input de Nombre de Usuario", async () => {
    const input = screen.getByLabelText(/Nombre de Usuario/i);
    await userEvent.type(input, "CualquierNombre");
    expect(input.value).toBe("CualquierNombre");
  });
  it("permite escribir en el input de Nombre de Partida", async () => {
    const input = screen.getByLabelText(/Nombre de la Partida/i);
    await userEvent.type(input, "CualquierNombre para la partida");
    expect(input.value).toBe("CualquierNombre para la partida");
  });
  it("permite escribir en la fecha de nacimiento", async () => {
    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    await userEvent.type(input, "2000-05-15");
    expect(input.value).toBe("2000-05-15");
  });
  it("permite elegir la cantidad de jugadores minima y maxima", async () => {
    const minSelect = screen.getByTestId("minPlayers");
    const maxSelect = screen.getByTestId("maxPlayers");
    const options = Array.from(minSelect.options)
      .map((o) => o.value)
      .filter((v) => v);
    await userEvent.selectOptions(minSelect, options[0]);
    expect(minSelect.value).toBe(options[0]);
    const options1 = Array.from(maxSelect.options)
      .map((o) => o.value)
      .filter((v) => v);
    await userEvent.selectOptions(maxSelect, options1[0]);
    expect(maxSelect.value).toBe(options1[0]);
  });
  it("permite elegir el avatar", async () => {
    const avatars = screen.getAllByRole("img");
    await userEvent.click(avatars[2]);
    expect(avatars[2]).toHaveClass("border-orange-500");
  });
});

describe("CreateFormGame - validaciones de errores", () => {
  const mockSubmit = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    render(<CreateFormGame onSubmit={mockSubmit} onClose={mockClose} />);
  });

  it("muestra un error si el Nombre de Usuario está vacío al hacer submit", async () => {
    const input = screen.getByLabelText(/Nombre de Usuario/i);
    await userEvent.clear(input); // campo vacío

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton); // enviar el form

    expect(screen.getByText(/Ingresar nombre de usuario/i)).toBeInTheDocument();
  });
  it("muestra un error si el Nombre de Partida está vacío al hacer submit", async () => {
    const input = screen.getByLabelText(/Nombre de la Partida/i);
    await userEvent.clear(input); // campo vacío

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton); // enviar el form

    expect(
      screen.getByText(/Ingresar nombre para la partida/i)
    ).toBeInTheDocument();
  });
  it("muestra un error si se ingresa mal la fecha de cumpleaños", async () => {
    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    await userEvent.clear(input); // campo vacío

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton); // enviar el form

    expect(
      screen.getByText(/Ingresar fecha de nacimiento/i)
    ).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.click(submitButton);
  });
  it("muestra un error si se ingresa una fecha menor a 1910", async () => {
    const input = screen.getByLabelText(/Fecha de nacimiento/i);
    await userEvent.type(input, "1810-05-15");

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton); // enviar el form
    expect(
      await screen.findByText((text) =>
        text.includes("La fecha debe estar entre")
      )
    ).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.click(submitButton);
  });

  it("muestra un error si el minimo es mas grande que el maximo de jugadores", async () => {
    const minSelect = screen.getByTestId("minPlayers");
    const maxSelect = screen.getByTestId("maxPlayers");

    await userEvent.selectOptions(minSelect, "6");
    await userEvent.selectOptions(maxSelect, "3");

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton);
    expect(
      screen.getByText(/El mínimo no puede ser mayor que el máximo/i)
    ).toBeInTheDocument();
  });
  it("muestra un error si no se elije el avatar", async () => {
    const avatars = screen.getAllByRole("img");
    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton);
    expect(screen.getByText(/Seleccioná un avatar/i)).toBeInTheDocument();
  });
});

describe("CreateFormGame - validacion formulario completo", () => {
  const mockSubmit = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear(); // limpia llamadas anteriores
    render(<CreateFormGame onSubmit={mockSubmit} onClose={mockClose} />);
  });

  it("llena todo el formulario y envía los datos correctos", async () => {
    await userEvent.type(
      screen.getByLabelText(/Nombre de Usuario/i),
      "Micaela"
    );
    await userEvent.type(
      screen.getByLabelText(/Nombre de la Partida/i),
      "Partida 1"
    );
    await userEvent.type(
      screen.getByLabelText(/Fecha de nacimiento/i),
      "2000-05-10"
    );

    await userEvent.selectOptions(screen.getByTestId("minPlayers"), "2");
    await userEvent.selectOptions(screen.getByTestId("maxPlayers"), "4");

    const avatars = screen.getAllByRole("img");
    await userEvent.click(avatars[2]); // avatar3.png

    const submitButton = screen.getByRole("button", { name: /Crear Partida/i });
    await userEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(
      {
        name: "Micaela",
        birthday: "2000-05-10",
        avatar: "avatar/avatar3.png",
      },
      {
        nameGame: "Partida 1",
        minPlayers: "2",
        maxPlayers: "4",
      }
    );
  });
});
